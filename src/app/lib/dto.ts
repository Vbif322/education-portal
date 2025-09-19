import { db } from "@/db/db";
import "server-only";
import { Lesson } from "../@types/course";
import { lessons, users, usersToLessons } from "@/db/schema";
import { getUser } from "./dal";
import { eq } from "drizzle-orm";
// import { getUser } from "@/app/lib/dal";
// import { db } from "@/db/db";
// import { eq } from "drizzle-orm";

// function canSeeUsername(viewer: User) {
//   return true;
// }

// function canSeePhoneNumber(viewer: User, team: string) {
//   return viewer.isAdmin || team === viewer.team;
// }

// export async function getProfileDTO(slug: string) {
//   const data = await db.query.usersTable.findMany({
//     where: eq(users.slug, slug),
//     // Return specific columns here
//   });
//   const user = data[0];

//   const currentUser = await getUser(user.id);

//   // Or return only what's specific to the query here
//   return {
//     username: canSeeUsername(currentUser) ? user.username : null,
//     phonenumber: canSeePhoneNumber(currentUser, user.team)
//       ? user.phonenumber
//       : null,
//   };
// }

export async function getAllLessons() {
  const user = await getUser();
  if (!user) return [];
  try {
    return await db.select().from(lessons);
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function getUserLessons() {
  const user = await getUser();
  if (!user) return [];
  try {
    const userLessons = await db.query.usersToLessons.findMany({
      with: {
        lesson: true,
      },
    });
    return userLessons.map((state) => state.lesson);
  } catch (error) {
    return [];
  }
}

export async function addLessonToUser(lessonId: Lesson["id"]) {
  const user = await getUser();
  if (!user) return;
  try {
    const res = await db
      .insert(usersToLessons)
      .values({ lessonId, userId: user.id })
      .onConflictDoNothing()
      .returning();
    return res;
  } catch (error) {
    return error;
  }
}
