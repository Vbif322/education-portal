import { signupFormSchema, FormState } from "@/app/lib/definitions";

export async function signup(state: FormState, formData: FormData) {
  // Validate form fields
  const validatedFields = signupFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  // If any form fields are invalid, return early
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  // signIn("credentials", formData);

  // Call the provider or db to create a user...
}
