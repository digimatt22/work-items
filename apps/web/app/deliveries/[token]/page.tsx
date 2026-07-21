import { getPublicDeliverableShare, prisma } from "@digicolony/db";

export const dynamic = "force-dynamic";

export default async function PublicDeliveryPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { token } = await params;
  const { error } = await searchParams;
  const share = await getPublicDeliverableShare(prisma, token);
  const now = new Date();
  const available = Boolean(share && !share.revokedAt && share.expiresAt > now);

  return (
    <main className="grid min-h-screen place-items-center bg-app px-5 py-10">
      <section className="w-full max-w-lg rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
          DigiColony delivery
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink">
          {available ? share?.asset.filename : "This delivery is unavailable"}
        </h1>
        {available && share ? (
          <>
            <p className="mt-2 text-sm leading-6 text-muted">
              {share.project.client.name} shared this file for{" "}
              {share.project.name}. Enter the password provided with the link to
              download it.
            </p>
            {error ? (
              <p
                className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                The file could not be downloaded. Check the password or ask your
                DigiColony contact for a new link.
              </p>
            ) : null}
            <form
              action={`/api/deliveries/${token}/download`}
              className="mt-6 grid gap-4"
              method="post"
            >
              <label className="grid gap-2 text-sm font-bold text-ink">
                Download password
                <input
                  autoComplete="current-password"
                  autoFocus
                  className="h-12 rounded-xl border border-line bg-white px-4 text-base outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  name="password"
                  required
                  type="password"
                />
              </label>
              <button
                className="h-12 rounded-xl bg-indigo-600 px-5 text-sm font-bold text-white hover:bg-indigo-700"
                type="submit"
              >
                Download file
              </button>
            </form>
            <p className="mt-5 text-xs text-soft">
              Link expires {share.expiresAt.toLocaleString()}.
            </p>
          </>
        ) : (
          <p className="mt-3 text-sm leading-6 text-muted">
            The link may have expired or been revoked. Ask your DigiColony
            contact to create a new delivery link.
          </p>
        )}
      </section>
    </main>
  );
}
