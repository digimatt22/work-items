import {
  createPrismaWorkItemRepository,
  createPrismaWorkspaceRepository,
  prisma
} from "@digicolony/db";
import {
  listVisibleWorkspaceProjects,
  listVisibleWorkItems,
  listWorkspaceClients,
  type Principal
} from "@digicolony/shared";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { principalFromSession } from "../../src/auth/principal";
import { ConfirmSubmitButton } from "../components/ConfirmSubmitButton";
import { EmptyState, MetricCard, PageHeader, buttonClass } from "../components/ui";
import {
  archiveClientAction
} from "../workspaces/actions";

function isAdmin(principal: Principal): boolean {
  return principal.kind === "user" && principal.user.role === "ADMIN";
}

function countForClient<T extends { clientId: string }>(
  records: readonly T[],
  clientId: string
): number {
  return records.filter((record) => record.clientId === clientId).length;
}

function countActiveForClient<T extends { clientId: string; pipelineStatusLabel?: string }>(
  records: readonly T[],
  clientId: string
): number {
  return records.filter(
    (record) => record.clientId === clientId && record.pipelineStatusLabel !== "Done"
  ).length;
}

export default async function ClientsPage() {
  const session = await auth();
  const principal = principalFromSession(session);

  if (!principal) {
    redirect("/sign-in");
  }

  const admin = isAdmin(principal);

  if (!admin) {
    redirect("/work-items");
  }

  const repository = createPrismaWorkspaceRepository(prisma);
  const workItemRepository = createPrismaWorkItemRepository(prisma);
  const [clients, projects, workItems] = await Promise.all([
    listWorkspaceClients(repository, principal),
    listVisibleWorkspaceProjects(repository, principal),
    listVisibleWorkItems(workItemRepository, principal)
  ]);
  const activeWorkItems = workItems.filter((item) => item.pipelineStatusLabel !== "Done");
  const reviewWorkItems = workItems.filter((item) => item.pipelineStatusLabel === "In Review");

  const busiestClients = [...clients].sort(
    (left, right) => countForClient(workItems, right.id) - countForClient(workItems, left.id)
  );

  return (
    <main className="min-h-screen bg-app">
      <PageHeader
        description="Scan client health, active projects, and the volume each account is adding to the system."
        eyebrow="Client Portfolio"
        title="Client portfolio"
      >
        <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 xl:min-w-[520px]">
          <MetricCard detail="Active accounts" label="Clients" value={clients.length} />
          <MetricCard detail="Visible scope" label="Projects" value={projects.length} />
          <MetricCard detail="Open commitments" label="Active" tone="dark" value={activeWorkItems.length} />
          <MetricCard detail="Needs review" label="Review" value={reviewWorkItems.length} />
        </div>
      </PageHeader>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:px-10">
        <div className="rounded-3xl border border-line bg-surface shadow-card">
          <div className="flex flex-col gap-3 border-b border-line p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Accounts</h2>
              <p className="mt-1 text-sm text-muted">Open a client for context, contacts, users, and detailed project management.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {busiestClients.slice(0, 3).map((client) => (
                <Link key={client.id} className="rounded-full bg-blue-soft px-3 py-1.5 text-xs font-bold text-muted hover:text-indigo-600" href={`/clients/${client.id}`}>
                  {client.name}: {countForClient(workItems, client.id)} items
                </Link>
              ))}
            </div>
          </div>
          <div className="divide-y divide-line">
          {clients.map((client) => {
            const clientProjects = projects.filter(
              (project) => project.clientId === client.id
            );
            const totalItems = countForClient(workItems, client.id);
            const activeItems = countActiveForClient(workItems, client.id);
            const reviewItems = workItems.filter(
              (item) => item.clientId === client.id && item.pipelineStatusLabel === "In Review"
            ).length;

            return (
              <article key={client.id} className="grid gap-4 p-5 transition hover:bg-blue-soft/35 xl:grid-cols-[minmax(260px,1fr)_minmax(420px,1.4fr)_360px]">
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-sm font-bold text-white">
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <Link className="line-clamp-2 text-lg font-bold tracking-tight text-ink hover:text-indigo-600" href={`/clients/${client.id}`}>
                        {client.name}
                      </Link>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                        {client.description ?? "No client context captured yet."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap gap-2">
                    {clientProjects.slice(0, 5).map((project) => {
                      const projectItems = workItems.filter((item) => item.projectId === project.id);

                      return (
                        <Link
                          key={project.id}
                          className="rounded-xl border border-line bg-white px-3 py-2 text-xs font-bold text-ink hover:border-indigo-200 hover:text-indigo-600"
                          data-testid={`project-card-${project.id}`}
                          href={`/projects/${project.id}`}
                        >
                          {project.name}
                          <span className="ml-2 text-soft">{projectItems.length}</span>
                        </Link>
                      );
                    })}
                    {clientProjects.length === 0 ? (
                      <span className="rounded-xl border border-dashed border-line px-3 py-2 text-xs font-bold text-soft">
                        No active projects
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-blue-soft px-3 py-1.5 text-xs font-bold text-muted">
                      {clientProjects.length} projects
                    </span>
                    <span className="rounded-full bg-blue-soft px-3 py-1.5 text-xs font-bold text-muted">
                      {totalItems} items
                    </span>
                    <span className="rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-white">
                      {activeItems} active
                    </span>
                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">
                      {reviewItems} review
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Link className={buttonClass("secondary")} href={`/work-items?clientIds=${client.id}`}>
                      Main board
                    </Link>
                    <Link className={buttonClass("primary")} href={`/clients/${client.id}`}>
                      Details
                    </Link>
                    {admin ? (
                      <form action={archiveClientAction}>
                        <input name="clientId" type="hidden" value={client.id} />
                        <ConfirmSubmitButton className={buttonClass("danger")} message={`Archive ${client.name}?`} type="submit">
                          Archive
                        </ConfirmSubmitButton>
                      </form>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        </div>

        {clients.length === 0 ? (
          <EmptyState description="Create a client account to start collecting projects and work." title="No clients yet" />
        ) : null}
      </section>
    </main>
  );
}
