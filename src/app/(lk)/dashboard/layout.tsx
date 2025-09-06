import { verifySession } from "@/app/lib/dal";
import Header from "@/app/components/header/Header";
import { FC } from "react";
import Navbar from "@/app/components/navbar/Navbar";

const DashboardLayout: FC<
  Readonly<{
    children: React.ReactNode;
  }>
> = async ({ children }) => {
  const session = await verifySession();
  console.log(session, "session");
  return (
    <>
      <Header />
      <Navbar />
      <div style={{ padding: 32, maxWidth: "1200px", margin: "auto" }}>
        {children}
      </div>
    </>
  );
};

export default DashboardLayout;
