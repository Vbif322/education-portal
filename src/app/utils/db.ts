import { IUser } from "../@types/user";

export async function getUserFromDb(
  email: string,
  password: string
): Promise<IUser> {
  return { login: email, role: "user" };
}
