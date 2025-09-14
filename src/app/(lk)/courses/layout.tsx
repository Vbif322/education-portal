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
      {/* <Divider
        style={{
          position: "fixed",
          top: "calc(var(--header-height)+16px)",
          zIndex: 1000,
        }}
      /> */}
      {children}
    </>
  );
};

export default CourseLayout;
