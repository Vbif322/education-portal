import { FC } from "react";
import UI from "./ui";
import {
  getCourseMetadataById,
  isUserEnrolledInCourse,
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

  return <UI {...course} user={user} isEnrolled={isEnrolled} />;
};

export default CoursePage;
