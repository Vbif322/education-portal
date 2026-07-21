import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { eq } from "drizzle-orm";
import { getUser } from "@/app/lib/dal";
import { canAccessLesson } from "@/app/lib/dal/lesson.dal";
import { db } from "@/db/db";
import { lessons } from "@/db/schema";
import { getVideoPath } from "@/app/utils/helpers";

const stat = promisify(fs.stat);

export async function GET(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lessonId = Number(req.nextUrl.searchParams.get("lessonId"));
    if (!Number.isInteger(lessonId) || lessonId <= 0) {
      return NextResponse.json(
        { error: "Некорректный идентификатор урока" },
        { status: 400 }
      );
    }

    // Проверка права на конкретный урок, а не только факта логина
    if (!(await canAccessLesson(lessonId, user))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Имя файла берётся из БД, а не из запроса клиента
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.id, lessonId),
      columns: { videoURL: true },
    });
    if (!lesson?.videoURL) {
      return NextResponse.json(
        { error: "Видео не найдено" },
        { status: 404 }
      );
    }

    // Дополнительная защита от Path Traversal (getVideoPath уже берёт basename)
    const videosDir = path.join(process.cwd(), "src", "videos");
    const filepath = getVideoPath(lesson.videoURL);

    if (!filepath.startsWith(videosDir + path.sep)) {
      return NextResponse.json(
        { error: "Недопустимый путь к файлу" },
        { status: 400 }
      );
    }

    const range = req.headers.get("range");
    const stats = await stat(filepath);
    if (range) {
      // Range запрос (для перемотки и частичной загрузки)
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunkSize = end - start + 1;

      // Создаем поток для чтения части файла
      const stream = fs.createReadStream(filepath, { start, end });

      // Создаем ReadableStream для Next.js
      const readableStream = new ReadableStream({
        start(controller) {
          stream.on("data", (chunk) => {
            controller.enqueue(chunk);
          });

          stream.on("end", () => {
            controller.close();
          });

          stream.on("error", (error) => {
            controller.error(error);
          });
        },
        cancel() {
          stream.destroy();
        },
      });

      // Возвращаем частичный контент
      return new NextResponse(readableStream, {
        status: 206,
        headers: {
          "Content-Range": `bytes ${start}-${end}/${stats.size}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": "video/mp4",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    } else {
      const stream = fs.createReadStream(filepath);
      const readableStream = new ReadableStream({
        start(controller) {
          stream.on("data", (chunk) => {
            controller.enqueue(chunk);
          });

          stream.on("end", () => {
            controller.close();
          });

          stream.on("error", (error) => {
            controller.error(error);
          });
        },
        cancel() {
          stream.destroy();
        },
      });

      return new NextResponse(readableStream, {
        status: 200,
        headers: {
          "Content-Length": stats.size.toString(),
          "Content-Type": "video/mp4",
          "Accept-Ranges": "bytes",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка", details: JSON.stringify(error) },
      { status: 400 }
    );
  }
}
