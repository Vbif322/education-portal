export async function POST(request: Request) {
  const res = await request.json();
  console.log(res, "req");
  return Response.json({ success: true });
}
