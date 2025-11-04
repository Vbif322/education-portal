import { db } from "@/db/db";
import { modules } from "@/db/schema";

export async function getAllModules(
  config?: Partial<{
    limit: number;
  }>
) {
  try {
    let query = db.select().from(modules).$dynamic();
    if (config?.limit) {
      query = query.limit(config.limit);
    }
    return await query;
  } catch (error) {
    console.log(error);
    return [];
  }
}
