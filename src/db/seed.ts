import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import * as schema from "./schema/index";
import { subscription, users } from "./schema/users";

/**
 * Инициализация данных: создание стартового администратора.
 * Идемпотентно — повторный запуск не создаёт дубликат.
 *
 * Запуск: npm run db:seed
 * Настройка через .env: SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
 */

const email = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
const password = process.env.SEED_ADMIN_PASSWORD ?? "admin12345";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL не задан. Скопируйте .env.example в .env.");
  }

  const db = drizzle(process.env.DATABASE_URL, { schema });

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`✔ Администратор ${email} уже существует — пропускаем.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [admin] = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      role: "admin",
      sessionID: crypto.randomUUID(),
    })
    .returning({ id: users.id });

  await db.insert(subscription).values({
    userId: admin.id,
    type: "Все включено",
    endedAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // +1 год
  });

  console.log(`✔ Создан администратор: ${email} (пароль: ${password})`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("✖ Ошибка при инициализации данных:", err);
    process.exit(1);
  });
