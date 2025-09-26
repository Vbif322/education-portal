import { writeFile } from "fs/promises";
import fs from "fs";
import * as fsp from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { lessonFormSchema } from "@/app/lib/definitions";
import z from "zod";
import { db } from "@/db/db";
import { lessons } from "@/db/schema";
import { getUser } from "@/app/lib/dal";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
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

    const bytes = await fields.data.file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filepath = path.join(
      process.cwd(),
      "src",
      "videos",
      fields.data.file.name
    );

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
    await db.insert(lessons).values({
      name: fields.data.name,
      status: fields.data.status,
      videoURL: fields.data.file.name,
      description: fields.data.description,
    });

    await writeFile(filepath, buffer);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
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

    // Проверяем изменен ли файл
    if (isFileChanged) {
      const bytes = await fields.data.file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filepath = path.join(
        process.cwd(),
        "src",
        "videos",
        fields.data.file.name
      );
      // Если файл с таким названием уже существует, то перезаписываем, если нет - то удаляем старый
      if (!fs.existsSync(filepath)) {
        const oldFilename = await db
          .select({ field1: lessons.videoURL })
          .from(lessons)
          .where(eq(lessons.id, id));
        const oldFilepath = path.join(
          process.cwd(),
          "src",
          "videos",
          oldFilename[0].field1
        );
        await fsp.unlink(oldFilepath);
      }
      await db
        .update(lessons)
        .set({ ...fields.data, videoURL: file.name })
        .where(eq(lessons.id, id));
      await writeFile(filepath, buffer);
    } else {
      // Если файл не изменен, то обновляем данные других полей
      await db
        .update(lessons)
        .set({ ...other })
        .where(eq(lessons.id, id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Ошибка загрузки", details: error },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Недостаточно прав" }, { status: 403 });
    }
    const res = await request.json();
    if (!res.lessonId) {
      return NextResponse.json(
        { error: "Отсутствует lessonId с типом number" },
        { status: 400 }
      );
    }
    const response = await db
      .delete(lessons)
      .where(eq(lessons.id, res.lessonId))
      .returning({ url: lessons.videoURL });
    const filename = response[0].url;
    const filepath = path.join(process.cwd(), "src", "videos", filename);
    await fsp.unlink(filepath);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка", details: error },
      { status: 400 }
    );
  }
}
