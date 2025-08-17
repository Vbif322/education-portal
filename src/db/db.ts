import * as schema from "./schema";
import { drizzle } from "drizzle-orm/node-postgres";

export const db = drizzle(process.env.DATABASE_URL!);
// export const db = drizzle({
//     schema,
//   connection: {
//     url: process.env.DATABASE_URL!,
//   },
// });
