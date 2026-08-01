import { NextResponse } from "next/server";

export const runtime = "nodejs";
// Без этого Next пререндерит ответ на этапе build, и скрипт деплоя
// проверял бы замороженный JSON вместо живого процесса.
export const dynamic = "force-dynamic";

/**
 * Проверка живости процесса для scripts/deploy.sh.
 * Публичен: matcher в src/middleware.ts исключает /api.
 */
export async function GET() {
  return NextResponse.json(
    { status: "ok" },
    { headers: { "Cache-Control": "no-store" } }
  );
}
