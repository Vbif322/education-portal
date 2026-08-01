import { FC } from "react";
import UI from "./ui";
import {
  getCourseMetadataById,
  isUserEnrolledInCourse,
  canAccessCourse,
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

  // Единая проверка доступа: роль, публичность курса, подписка «Все включено»,
  // индивидуальный доступ к курсу или к любому уроку внутри него.
  const hasAccess = await canAccessCourse(courseId, user);

  return <UI {...course} user={user} isEnrolled={isEnrolled} hasAccess={hasAccess} />;
};

export default CoursePage;
