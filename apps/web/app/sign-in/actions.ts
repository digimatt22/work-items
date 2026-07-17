"use server";

import { redirect } from "next/navigation";
import { prisma } from "@digicolony/db";
import { signIn } from "../../auth";
import { isCredentialsSignInError } from "../../src/auth/errors";

export async function signInAction(formData: FormData) {
  const email = String(formData.get("email") ?? "")
    .toLowerCase()
    .trim();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      passwordCredential: {
        select: { mustChangePassword: true },
      },
    },
  });

  try {
    await signIn("credentials", {
      email,
      password: String(formData.get("password") ?? ""),
      redirectTo: user?.passwordCredential?.mustChangePassword
        ? "/settings/password?required=1"
        : "/",
    });
  } catch (error) {
    if (isCredentialsSignInError(error)) {
      redirect("/sign-in?error=credentials");
    }

    throw error;
  }
}
