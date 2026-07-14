import { signInAction } from "./actions";
import { buttonClass, compactFieldClass } from "../components/ui";

export default function SignInPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-app px-5 py-8">
      <section className="w-full max-w-md">
        <div className="rounded-[2rem] border border-line bg-surface p-8 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
            DigiColony Ops
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink">Sign in</h1>
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
          <label className="mt-4 block text-sm font-bold text-ink" htmlFor="password">
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
          <button className={`mt-6 w-full ${buttonClass("primary")}`} type="submit">
            Sign in
          </button>
        </form>
        </div>
      </section>
    </main>
  );
}
