import { FC } from "react";
import Aside from "../subcomponents/Aside";

const ModuleLayout: FC<
  Readonly<{
    children: React.ReactNode;
  }>
> = async ({ children }) => {
  return (
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
  );
};

export default ModuleLayout;
