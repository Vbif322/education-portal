import { verifySession } from "@/app/lib/dal";

export default async function Dashboard() {
  const session = await verifySession();
  console.log(session, "session");
  return <div>dashboard</div>;
}
