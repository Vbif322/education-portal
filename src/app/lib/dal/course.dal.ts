import { db } from "@/db/db";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getAllCourses(
  config?: Partial<{
    onlyPublic: boolean;
    limit: number;
  }>
) {
  try {
    let query = db.select().from(courses).$dynamic();
    if (config?.onlyPublic) {
      query = query.where(eq(courses.privacy, "public"));
    }
    if (config?.limit) {
      query = query.limit(config.limit);
    }
    return await query;
  } catch (error) {
    console.log(error);
    return [];
  }
}
