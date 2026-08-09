import UsersTable from "@/app/components/tables/users-table";
import { getAllUsers } from "@/app/lib/dal/users.dal";
import { getUser } from "@/app/lib/dal";
import { notFound } from "next/navigation";
import { canManage } from "@/app/utils/permissions";
import EmptyState from "@/app/ui/EmptyState/EmptyState";
import { Users } from "lucide-react";
import s from "./style.module.css";

export const metadata = { title: "Пользователи" };

export default async function UsersPage() {
  const currentUser = await getUser();
  if (!canManage(currentUser)) {
    notFound();
  }

  const users = await getAllUsers();

  return (
    <div className={s.page}>
      <h1 className={s.pageTitle}>Пользователи</h1>
      {users.length > 0 ? (
        <UsersTable data={users} />
      ) : (
        <EmptyState
          icon={<Users size={28} />}
          title="Пользователей пока нет"
          description="Здесь появятся зарегистрированные пользователи с их подписками и доступами."
        />
      )}
    </div>
  );
}
