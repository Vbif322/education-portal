import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import { seed } from "drizzle-seed";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema,
});

// async function main() {
//   const db = drizzle(process.env.DATABASE_URL!);
//   await seed(db, schema, { count: 10 });
// }

// main();
