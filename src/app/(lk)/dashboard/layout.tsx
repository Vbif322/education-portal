import { getUser } from "@/app/lib/dal";
import Header from "@/app/components/header/Header";
import { FC } from "react";
import Navbar from "@/app/components/navbar/Navbar";
import Divider from "@/app/ui/Divider/Divider";

const DashboardLayout: FC<
  Readonly<{
    children: React.ReactNode;
  }>
> = async ({ children }) => {
  const user = await getUser();
  return (
    <>
      <Header role={user?.role} />
      <Divider />
      <div
        style={{
          padding: 32,
          maxWidth: "1200px",
          margin: "auto",
        }}
      >
        {children}
      </div>
    </>
  );
};

export default DashboardLayout;
