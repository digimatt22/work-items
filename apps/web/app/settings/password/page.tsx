import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from "../../../src/auth/password";
import {
  PageHeader,
  Panel,
  buttonClass,
  fieldClass,
} from "../../components/ui";
import { changePasswordAction } from "./actions";

const messages: Record<string, string> = {
  confirmation: "The new password and confirmation do not match.",
  current: "The current password is incorrect.",
  length: `Use between ${MIN_PASSWORD_LENGTH} and ${MAX_PASSWORD_LENGTH} characters.`,
  required: "Complete all password fields.",
  reuse: "Choose a new password that is different from the current password.",
};

export default async function PasswordSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { error } = await searchParams;
  const message = error ? messages[error] : undefined;
  const required = session.user.mustChangePassword;

  return (
    <main>
      <PageHeader
        description={
          required
            ? "Replace your temporary password before continuing. You will be signed out after a successful change."
            : "Verify your current password before replacing it. You will be signed out after a successful change."
        }
        eyebrow="Account security"
        title={required ? "Set a new password" : "Change password"}
      />
      <div className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
        <Panel
          description={`Use ${MIN_PASSWORD_LENGTH}–${MAX_PASSWORD_LENGTH} characters and do not reuse your current password.`}
          title="Password"
        >
          {message ? (
            <p
              className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
              role="alert"
            >
              {message}
            </p>
          ) : null}
          <form action={changePasswordAction} className="grid gap-5">
            <label
              className="text-sm font-bold text-ink"
              htmlFor="currentPassword"
            >
              Current password
              <input
                autoComplete="current-password"
                className={`mt-2 ${fieldClass}`}
                id="currentPassword"
                name="currentPassword"
                required
                type="password"
              />
            </label>
            <label className="text-sm font-bold text-ink" htmlFor="newPassword">
              New password
              <input
                autoComplete="new-password"
                className={`mt-2 ${fieldClass}`}
                id="newPassword"
                maxLength={MAX_PASSWORD_LENGTH}
                minLength={MIN_PASSWORD_LENGTH}
                name="newPassword"
                required
                type="password"
              />
            </label>
            <label
              className="text-sm font-bold text-ink"
              htmlFor="confirmation"
            >
              Confirm new password
              <input
                autoComplete="new-password"
                className={`mt-2 ${fieldClass}`}
                id="confirmation"
                maxLength={MAX_PASSWORD_LENGTH}
                minLength={MIN_PASSWORD_LENGTH}
                name="confirmation"
                required
                type="password"
              />
            </label>
            <div>
              <button className={buttonClass("primary")} type="submit">
                Change password
              </button>
            </div>
          </form>
        </Panel>
      </div>
    </main>
  );
}
