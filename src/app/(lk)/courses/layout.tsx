import Header from "@/app/components/header/Header";
import { FC } from "react";

const CourseLayout: FC<
  Readonly<{
    children: React.ReactNode;
  }>
> = ({ children }) => {
  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default CourseLayout;
