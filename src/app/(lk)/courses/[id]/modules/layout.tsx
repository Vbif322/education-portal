import { FC } from "react";
import Header from "@/app/components/header/Header";
import { getUser } from "@/app/lib/dal";
import Aside from "../../../../(public)/courses/[id]/subcomponents/Aside";

const ModuleLayout: FC<
  Readonly<{
    children: React.ReactNode;
  }>
> = async ({ children }) => {
  const user = await getUser();

  return (
    <>
      <Header variant="private" role={user?.role} />
      <div
        style={{
          position: "relative",
          backgroundColor: "rgb(243 244 246)",
          minHeight: "100vh",
        }}
      >
        <Aside />
        <div style={{ display: "flex", justifyContent: "center" }}>
          {children}
        </div>
      </div>
    </>
  );
};

export default ModuleLayout;
