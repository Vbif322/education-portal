import fs, { createWriteStream } from "fs";
import * as fsp from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { lessonFormSchema } from "@/app/lib/definitions";
import z from "zod";
import { db } from "@/db/db";
import { lessons } from "@/db/schema";
import { getUser } from "@/app/lib/dal";
import { eq } from "drizzle-orm";
import { pipeline } from "stream/promises";
import { Readable } from "stream";
import { getVideoPath } from "@/app/utils/helpers";
import { auditService } from "@/lib/audit/audit.service";
import { canManage, isAdmin } from "@/app/utils/permissions";

// Максимальный размер файла: 1000 MB
const MAX_FILE_SIZE = 1000;
// Разрешенные расширения видео
const ALLOWED_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv"];

/**
 * Валидирует видеофайл по размеру и расширению
 */
function validateVideoFile(file: File): { valid: boolean; error?: string } {
  // Проверка размера
  if (file.size > MAX_FILE_SIZE * 1024 * 1024) {
    return {
      valid: false,
      error: `Размер файла превышает максимальный (${MAX_FILE_SIZE} MB)`,
    };
  }

  // Проверка расширения
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Неподдерживаемый формат файла. Разрешены: ${ALLOWED_EXTENSIONS.join(
        ", "
      )}`,
    };
  }

  return { valid: true };
}

const buff = Buffer.alloc(100);
const header = Buffer.from("mvhd");

export async function POST(request: NextRequest) {
  let tempFilepath: string | null = null;

  try {
    // Проверка авторизации
    const user = await getUser();
    if (!canManage(user)) {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }

    const formData = await request.formData();

    const fields = lessonFormSchema.safeParse({
      file: formData.get("videofile") as File,
      name: formData.get("name"),
      status: formData.get("status"),
      description: formData.get("description"),
    });

    if (!fields.success) {
      return NextResponse.json(z.treeifyError(fields.error), { status: 400 });
    }

    // Валидация видеофайла
    const validation = validateVideoFile(fields.data.file);
    if (!validation.valid) {
      return NextResponse.json(
        {
          properties: {
            videofile: { errors: [validation.error] },
          },
        },
        { status: 400 }
      );
    }

    // Использование безопасного пути с санитизацией
    const filepath = getVideoPath(fields.data.file.name);
    tempFilepath = filepath;

    if (fs.existsSync(filepath)) {
      return NextResponse.json(
        {
          properties: {
            videofile: { errors: ["Файл с таким именем уже существует"] },
          },
        },
        { status: 409 }
      );
    }

    const stream = fields.data.file.stream();
    const writeStream = createWriteStream(filepath);

    // Сначала загружаем файл, потом записываем в БД
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await pipeline(Readable.fromWeb(stream as any), writeStream);

    const file = await fsp.open(filepath);
    const { buffer } = await file.read(buff, 0, 100, 0);

    await file.close();

    const start = buffer.indexOf(header) + 16;
    const timeScale = buffer.readUInt32BE(start);
    const duration = buffer.readUInt32BE(start + 4);
    const videoDuration = Math.floor(duration / timeScale);

    // Только после успешной загрузки файла записываем в БД
    const [newLesson] = await db
      .insert(lessons)
      .values({
        name: fields.data.name,
        status: fields.data.status,
        videoURL: path.basename(fields.data.file.name),
        description: fields.data.description,
        duration: videoDuration,
      })
      .returning();

    // Логируем создание урока (асинхронно)
    auditService
      .logAdminAction({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role as "admin",
        actionType: "lesson_create",
        resourceType: "lesson",
        resourceId: String(newLesson.id),
        changesAfter: newLesson,
        status: "success",
      })
      .catch((err) => console.error("Audit logging failed:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка при создании урока:", error);

    // Логируем ошибку (асинхронно)
    const user = await getUser();
    if (user) {
      auditService
        .logAdminAction({
          userId: user.id,
          userEmail: user.email,
          userRole: user.role as "admin",
          actionType: "lesson_create",
          resourceType: "lesson",
          resourceId: "unknown",
          status: "failure",
          errorMessage: error instanceof Error ? error.message : String(error),
        })
        .catch((err) => console.error("Audit logging failed:", err));
    }

    // Очистка временных файлов при ошибке
    if (tempFilepath && fs.existsSync(tempFilepath)) {
      try {
        await fsp.unlink(tempFilepath);
      } catch (cleanupError) {
        console.error("Ошибка при очистке временного файла:", cleanupError);
      }
    }

    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  let tempFilepath: string | null = null;

  try {
    // Проверка авторизации
    const user = await getUser();
    if (!canManage(user)) {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }

    const id = Number(request.nextUrl.searchParams.get("id"));
    if (isNaN(id)) {
      return NextResponse.json({ error: "id не найдено" }, { status: 400 });
    }

    const formData = await request.formData();

    const fields = lessonFormSchema.safeParse({
      file: formData.get("videofile") as File,
      name: formData.get("name"),
      status: formData.get("status"),
      description: formData.get("description"),
    });

    if (!fields.success) {
      return NextResponse.json(z.treeifyError(fields.error), { status: 400 });
    }

    const isFileChanged = fields.data.file.type !== "application/octet-stream";
    const { file, ...other } = fields.data;

    // Получаем данные урока до изменений для аудита
    const existingLesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, id),
    });

    if (!existingLesson) {
      return NextResponse.json({ error: "Урок не найден" }, { status: 404 });
    }

    const changesBefore = { ...existingLesson };

    // Проверяем изменен ли файл
    if (isFileChanged) {
      // Валидация видеофайла
      const validation = validateVideoFile(fields.data.file);
      if (!validation.valid) {
        return NextResponse.json(
          {
            properties: {
              videofile: { errors: [validation.error] },
            },
          },
          { status: 400 }
        );
      }

      // Использование безопасного пути с санитизацией
      const filepath = getVideoPath(fields.data.file.name);
      tempFilepath = filepath;

      const stream = fields.data.file.stream();
      const writeStream = createWriteStream(filepath);

      // ИСПРАВЛЕНИЕ: Если файл с новым названием не существует, удаляем старый
      if (!fs.existsSync(filepath)) {
        const oldFilename = await db
          .select({ videoURL: lessons.videoURL })
          .from(lessons)
          .where(eq(lessons.id, id));

        if (oldFilename.length > 0 && oldFilename[0].videoURL) {
          const oldFilepath = getVideoPath(oldFilename[0].videoURL);
          if (fs.existsSync(oldFilepath)) {
            await fsp.unlink(oldFilepath);
          }
        }
      }

      // ИСПРАВЛЕНИЕ: Сначала загружаем файл, потом обновляем БД
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await pipeline(Readable.fromWeb(stream as any), writeStream);

      // Только после успешной загрузки обновляем БД
      await db
        .update(lessons)
        .set({ ...fields.data, videoURL: path.basename(file.name) })
        .where(eq(lessons.id, id));
    } else {
      // Если файл не изменен, то обновляем данные других полей
      await db
        .update(lessons)
        .set({ ...other })
        .where(eq(lessons.id, id));
    }

    // Логируем обновление урока (асинхронно)
    auditService
      .logAdminAction({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role as "admin",
        actionType: "lesson_update",
        resourceType: "lesson",
        resourceId: String(id),
        changesBefore,
        changesAfter: isFileChanged
          ? { ...fields.data, videoURL: path.basename(file.name), id }
          : { ...other, id },
        status: "success",
      })
      .catch((err) => console.error("Audit logging failed:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка при обновлении урока:", error);

    // Логируем ошибку (асинхронно)
    const user = await getUser();
    if (user) {
      auditService
        .logAdminAction({
          userId: user.id,
          userEmail: user.email,
          userRole: user.role as "admin",
          actionType: "lesson_update",
          resourceType: "lesson",
          resourceId: "unknown",
          status: "failure",
          errorMessage: error instanceof Error ? error.message : String(error),
        })
        .catch((err) => console.error("Audit logging failed:", err));
    }

    // Очистка временных файлов при ошибке
    if (tempFilepath && fs.existsSync(tempFilepath)) {
      try {
        await fsp.unlink(tempFilepath);
      } catch (cleanupError) {
        console.error("Ошибка при очистке временного файла:", cleanupError);
      }
    }

    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    if (!isAdmin(user)) {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }

    const res = await request.json();
    if (!res.lessonId) {
      return NextResponse.json(
        { error: "Отсутствует lessonId с типом number" },
        { status: 400 }
      );
    }

    // Получаем данные урока для аудита перед удалением
    const existingLesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, res.lessonId),
    });

    if (!existingLesson) {
      return NextResponse.json({ error: "Урок не найден" }, { status: 404 });
    }

    const changesBefore = { ...existingLesson };

    const response = await db
      .delete(lessons)
      .where(eq(lessons.id, res.lessonId))
      .returning({ url: lessons.videoURL });

    const filename = response[0].url;
    // Использование безопасного пути с санитизацией
    const filepath = getVideoPath(filename);

    if (fs.existsSync(filepath)) {
      await fsp.unlink(filepath);
    }

    // Логируем удаление урока (асинхронно)
    auditService
      .logAdminAction({
        userId: user.id,
        userEmail: user.email,
        userRole: user.role as "admin",
        actionType: "lesson_delete",
        resourceType: "lesson",
        resourceId: String(res.lessonId),
        changesBefore,
        status: "success",
      })
      .catch((err) => console.error("Audit logging failed:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ошибка при удалении урока:", error);

    // Логируем ошибку (асинхронно)
    const user = await getUser();
    if (user) {
      auditService
        .logAdminAction({
          userId: user.id,
          userEmail: user.email,
          userRole: user.role as "admin",
          actionType: "lesson_delete",
          resourceType: "lesson",
          resourceId: "unknown",
          status: "failure",
          errorMessage: error instanceof Error ? error.message : String(error),
        })
        .catch((err) => console.error("Audit logging failed:", err));
    }

    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
