import { signInAction } from "./actions";
import { buttonClass, compactFieldClass } from "../components/ui";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; passwordChanged?: string }>;
}) {
  const { error, passwordChanged } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-app px-5 py-8">
      <section className="w-full max-w-md">
        <div className="rounded-[2rem] border border-line bg-surface p-8 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            DigiColony Ops
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">
            Sign in
          </h1>
          {passwordChanged === "1" ? (
            <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              Password changed. Sign in with your new password.
            </p>
          ) : null}
          {error === "credentials" ? (
            <p
              className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
              role="alert"
            >
              Email or password is incorrect.
            </p>
          ) : null}
          <form action={signInAction} className="mt-6">
            <label className="block text-sm font-bold text-ink" htmlFor="email">
              Email
            </label>
            <input
              className={`mt-2 ${compactFieldClass}`}
              id="email"
              name="email"
              placeholder="name@company.com"
              required
              type="email"
            />
            <label
              className="mt-4 block text-sm font-bold text-ink"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className={`mt-2 ${compactFieldClass}`}
              id="password"
              name="password"
              placeholder="Password"
              required
              type="password"
            />
            <button
              className={`mt-6 w-full ${buttonClass("primary")}`}
              type="submit"
            >
              Sign in
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
