import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { promisify } from "util";

const stat = promisify(fs.stat);

export async function GET(req: NextRequest) {
  try {
    const filename = req.nextUrl.searchParams.get("name");
    if (!filename) {
      return NextResponse.json(
        { error: "Имя файла отсутствует в запросе" },
        { status: 400 }
      );
    }
    const range = req.headers.get("range");
    const filepath = path.join(process.cwd(), "src", "videos", filename);
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
