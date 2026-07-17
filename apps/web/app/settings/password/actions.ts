"use server";

import { prisma } from "@digicolony/db";
import { compare, hash } from "bcryptjs";
import { redirect } from "next/navigation";
import { auth, signOut } from "../../../auth";
import { validateNewPassword } from "../../../src/auth/password";

function fail(code: string): never {
  redirect(`/settings/password?error=${encodeURIComponent(code)}`);
}

export async function changePasswordAction(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  const validationError = validateNewPassword(newPassword, confirmation);

  if (validationError) {
    fail(validationError);
  }

  const credential = await prisma.passwordCredential.findUnique({
    where: { userId: session.user.id },
  });

  if (
    !credential ||
    !(await compare(currentPassword, credential.passwordHash))
  ) {
    fail("current");
  }

  if (await compare(newPassword, credential.passwordHash)) {
    fail("reuse");
  }

  const passwordHash = await hash(newPassword, 12);

  await prisma.$transaction([
    prisma.passwordCredential.update({
      where: { userId: session.user.id },
      data: { mustChangePassword: false, passwordHash },
    }),
    prisma.session.deleteMany({ where: { userId: session.user.id } }),
  ]);

  await signOut({ redirectTo: "/sign-in?passwordChanged=1" });
}
