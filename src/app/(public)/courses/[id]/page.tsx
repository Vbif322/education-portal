import { FC } from "react";
import UI from "./ui";
import {
  getCourseMetadataById,
  isUserEnrolledInCourse,
  getUserCourseAccess,
} from "@/app/lib/dal/course.dal";
import { notFound } from "next/navigation";
import { getUser } from "@/app/lib/dal";

type Props = {
  params: Promise<{ id: string }>;
};

const CoursePage: FC<Props> = async ({ params }) => {
  const { id } = await params;
  const courseId = parseInt(id);
  const user = await getUser()

  if (isNaN(courseId)) {
    notFound();
  }

  const course = await getCourseMetadataById(courseId);
  if (!course) {
    notFound();
  }
  const isEnrolled = await isUserEnrolledInCourse(courseId);

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
