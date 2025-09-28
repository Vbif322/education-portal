import Header from "@/app/components/header/Header";
import Divider from "@/app/ui/Divider/Divider";
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
