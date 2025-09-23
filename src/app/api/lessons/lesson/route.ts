import { writeFile } from "fs/promises";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";
import { lessonFormSchema } from "@/app/lib/definitions";
import z from "zod";
import { db } from "@/db/db";
import { lessons } from "@/db/schema";

export async function POST(request: Request) {
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
    const insert = await db.insert(lessons).values({
      name: fields.data.name,
      status: fields.data.status,
      videoURL: fields.data.file.name,
    });
    console.log(insert, "insert");

    // await writeFile(filepath, buffer);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Ошибка загрузки" }, { status: 400 });
  }
}
