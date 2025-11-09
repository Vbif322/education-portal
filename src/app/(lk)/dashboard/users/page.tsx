import UsersTable from "@/app/components/tables/users-table";
import { getAllUsers } from "@/app/lib/dal/users.dal";

export default async function UsersPage() {
  const users = await getAllUsers();
  return <UsersTable data={users} />;
}
