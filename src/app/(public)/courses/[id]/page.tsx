import { FC } from "react";
import UI from "./ui";
import {
  getCourseMetadataById,
  isUserEnrolledInCourse,
  getUserCourseAccess,
} from "@/app/lib/dal/course.dal";
import { notFound } from "next/navigation";
import { getOptionalUser } from "@/app/lib/dal";

type Props = {
  params: Promise<{ id: string }>;
};

const CoursePage: FC<Props> = async ({ params }) => {
  const { id } = await params;
  const courseId = parseInt(id);
  const user = await getOptionalUser()

  if (isNaN(courseId)) {
    notFound();
  }

  const course = await getCourseMetadataById(courseId);
  if (!course) {
    notFound();
  }
  // Только для залогиненного: иначе isUserEnrolledInCourse дёрнет getUser() → redirect.
  const isEnrolled = user ? await isUserEnrolledInCourse(courseId) : false;

  // Проверяем, есть ли у пользователя доступ к курсу
  let hasAccess = false;
  if (user) {
    const accessList = await getUserCourseAccess(user.id);
    hasAccess = accessList.some(
      (access) =>
        access.courseId === courseId &&
        (!access.expiresAt || new Date(access.expiresAt) > new Date())
    );
  }

  return <UI {...course} user={user} isEnrolled={isEnrolled} hasAccess={hasAccess} />;
};

export default CoursePage;
