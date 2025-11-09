import { FC } from "react";
import UI from "./ui";
import {
  getCourseById,
  isUserEnrolledInCourse,
} from "@/app/lib/dal/course.dal";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

const CoursePage: FC<Props> = async ({ params }) => {
  const { id } = await params;
  const courseId = parseInt(id);

  if (isNaN(courseId)) {
    notFound();
  }

  const course = await getCourseById(courseId, { withMetadata: true });
  if (!course) {
    notFound();
  }
  const isEnrolled = await isUserEnrolledInCourse(courseId);

  return <UI {...course} isEnrolled={isEnrolled} />;
};

export default CoursePage;
