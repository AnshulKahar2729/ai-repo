"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "~/auth";

// ...

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    // Extract email and password from FormData
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return "Please enter both email and password.";
    }

    console.log("Authenticating with email:", email);
    console.log("Authenticating with password:", password);

    const result = await signIn("credentials", {
      email,
      password,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      console.error("Authentication failed:", error.message);
      return "Authentication failed.";
    }
    throw error;
  }
}
