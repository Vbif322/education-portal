"use server";

import { getUser } from "@/app/lib/dal";
import { notFound, redirect } from "next/navigation";
import UserManagementClient from "./user-management-client";
import { getUserById } from "@/app/lib/dal/users.dal";
import { getAllCourses, getAllLessonsFromCourse, getUserCourseAccess } from "@/app/lib/dal/course.dal";
import { getAllLessons, getUserLessonAccess } from "@/app/lib/dal/lesson.dal";

export default async function UserManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const currentUser = await getUser();
  if (!currentUser || currentUser.role !== "admin") {
    redirect("/dashboard");
  }

  const user = await getUserById(id);
  if (!user) {
    notFound();
  }

  const [courseAccessList, lessonAccessList, allCourses, allLessons] = await Promise.all([
    getUserCourseAccess(id),
    getUserLessonAccess(id),
    getAllCourses(),
    getAllLessons(),
  ]);

  const lessonsFromCourses = courseAccessList.length > 0
    ? (await Promise.all(
          courseAccessList.map(async (access) => ({
            lessons: await getAllLessonsFromCourse(access.courseId),
            courseId: access.courseId
          }))
        ))
    : []
  return (
    <UserManagementClient
      user={user}
      courseAccess={courseAccessList}
      lessonAccess={lessonAccessList}
      allCourses={allCourses}
      allLessons={allLessons}
      lessonsFromCourses={lessonsFromCourses}
    />
  );
}
