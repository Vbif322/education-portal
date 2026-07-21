import Header from "@/app/components/header/Header";
import { getOptionalUser } from "@/app/lib/dal";
import { FC } from "react";

const CourseLayout: FC<
  Readonly<{
    children: React.ReactNode;
  }>
> = async ({ children }) => {
  const user = await getOptionalUser();

  return (
    <>
      <Header variant={user ? "private" : "public"} />
      {children}
    </>
  );
};

export default CourseLayout;
