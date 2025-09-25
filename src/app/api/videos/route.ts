import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const filename = req.nextUrl.searchParams.get("name");
    if (!filename) {
      return NextResponse.json(
        { error: "Имя файла не найдено" },
        { status: 400 }
      );
    }
    // const query = req.query
    // const range = req.headers.range;
    console.log(req.nextUrl, "req");
    return NextResponse.json({ test: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка", details: JSON.stringify(error) },
      { status: 400 }
    );
  }
}
