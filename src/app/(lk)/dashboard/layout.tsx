import { getUser } from "@/app/lib/dal";
import Header from "@/app/components/header/Header";
import { FC } from "react";
import s from "./layout.module.css";

const DashboardLayout: FC<
  Readonly<{
    children: React.ReactNode;
  }>
> = async ({ children }) => {
  const user = await getUser();
  return (
    <>
      <Header variant="private" user={user || undefined} />
      <main className={s.container}>{children}</main>
    </>
  );
};

export default DashboardLayout;
