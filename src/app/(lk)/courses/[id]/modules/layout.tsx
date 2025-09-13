import { FC } from "react";
import Aside from "../subcomponents/Aside";

const ModuleLayout: FC<
  Readonly<{
    children: React.ReactNode;
  }>
> = async ({ children }) => {
  return (
    <div style={{ position: "relative" }}>
      <Aside />
      <div style={{ display: "flex", justifyContent: "center" }}>
        {children}
      </div>
    </div>
  );
};

export default ModuleLayout;
