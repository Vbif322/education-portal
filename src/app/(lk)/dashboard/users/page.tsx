import UsersTable from "@/app/components/tables/users-table";
import { getAllUsers } from "@/app/lib/dal/users.dal";
import { getUser } from "@/app/lib/dal";
import { notFound } from "next/navigation";
import { canManage } from "@/app/utils/permissions";

export default async function UsersPage() {
  const currentUser = await getUser();
  if (!canManage(currentUser)) {
    notFound();
  }

  const users = await getAllUsers();
  return <UsersTable data={users} />;
}
