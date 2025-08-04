import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { signupFormSchema } from "./app/lib/definitions";
import { ZodError } from "zod";
import bcrypt from "bcrypt";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        try {
          let user;
          const { email, password } = await signupFormSchema.parseAsync(
            credentials
          );
          const pwHash = await bcrypt.hash(password, 10);
          user = await getUserFromDb(email, pwHash);

          if (!user) {
            throw new Error("Invalid credentials.");
          }
          return user;
        } catch (error) {
          if (error instanceof ZodError) {
            // Return `null` to indicate that the credentials are invalid
            return null;
          }
        }
      },
    }),
  ],
});
