import { FC } from "react";
import UI from "./ui";
import {
  getCourseMetadataById,
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

  const course = await getCourseMetadataById(courseId);
  if (!course) {
    notFound();
  }
  const isEnrolled = await isUserEnrolledInCourse(courseId);

  return <UI {...course} isEnrolled={isEnrolled} />;
};

export default CoursePage;
