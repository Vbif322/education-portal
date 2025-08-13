"use client";

import { signin } from "@/app/actions/auth";
import { useActionState } from "react";

export default function SignupForm() {
  const [state, action, pending] = useActionState(signin, undefined);
  console.log(state);

  // const onSubmit = async (data) => {
  //   try {
  //     const res = await signIn("credentials", {
  //       ...data,
  //       // redirect: false,
  //     });

  //     if (!res?.ok) {
  //       throw Error();
  //     }
  //   } catch (error) {
  //     console.error("Error [LOGIN]", error);
  //   }
  // };
  return (
    <form action={action}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" placeholder="Email" />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" />
      </div>
      <button type="submit" disabled={pending}>
        Sign Up
      </button>
    </form>
  );
}
