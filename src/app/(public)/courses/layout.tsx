import Header from "@/app/components/header/Header";
import { getUser } from "@/app/lib/dal";
import { FC } from "react";

const CourseLayout: FC<
  Readonly<{
    children: React.ReactNode;
  }>
> = async ({ children }) => {
  const user = await getUser();

  return (
    <>
      <Header variant={user ? "private" : "public"} />
      {children}
    </>
  );
};

export default CourseLayout;
