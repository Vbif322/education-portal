import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
// import { reset, seed } from "drizzle-seed";

export const db = drizzle(process.env.DATABASE_URL!, {
  schema,
});

// async function main() {
//   console.log("generate");
//   await seed(db, schema, { count: 10 }).refine((f) => ({
//     lessons: {
//       count: 15,
//       columns: {
//         description: f.loremIpsum({
//           sentencesCount: 1,
//         }),
//       },
//     },
//   }));
// }

// async function resetDB() {
//   console.log("reset");
//   await reset(db, schema);
// }

// main();
// resetDB();
