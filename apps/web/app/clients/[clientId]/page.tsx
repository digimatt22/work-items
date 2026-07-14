import {
  createPrismaWorkItemRepository,
  createPrismaWorkspaceRepository,
  prisma
} from "@digicolony/db";
import {
  listVisibleClientActivity,
  listVisibleWorkspaceProjects,
  listVisibleWorkItems,
  type Principal
} from "@digicolony/shared";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { principalFromSession } from "../../../src/auth/principal";
import { ConfirmSubmitButton } from "../../components/ConfirmSubmitButton";
import { Badge, EmptyState, MetricCard, PageHeader, Panel, PencilIcon, buttonClass, compactFieldClass, fieldClass } from "../../components/ui";
import {
  archiveProjectAction,
  deleteClientUserAction,
  updateClientAction,
  updateProjectAction,
  updateClientUserAction
} from "../../workspaces/actions";

function isAdmin(principal: Principal): boolean {
  return principal.kind === "user" && principal.user.role === "ADMIN";
}

export default async function ClientDetailPage({
  params
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
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
  const [client, projects, workItems, activity, users] = await Promise.all([
    prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        name: true,
        description: true,
        aiSummary: true,
        structuredContext: true,
        archivedAt: true
      }
    }),
    listVisibleWorkspaceProjects(repository, principal),
    listVisibleWorkItems(workItemRepository, principal),
    listVisibleClientActivity(repository, principal, clientId),
    prisma.user.findMany({
      where: { clientId },
      orderBy: { email: "asc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
  ]);

  if (!client || client.archivedAt) {
    return (
      <main className="min-h-screen bg-app">
        <section className="mx-auto max-w-4xl px-6 py-10">
          <Link className="text-sm font-bold text-indigo-600 hover:underline" href="/clients">
            Back to clients
          </Link>
          <Panel>
            <h1 className="text-2xl font-bold text-ink">Client not found</h1>
            <p className="mt-2 text-sm text-muted">
              The client either does not exist, is archived, or is outside your scope.
            </p>
          </Panel>
        </section>
      </main>
    );
  }

  const clientProjects = projects.filter((project) => project.clientId === clientId);
  const clientWorkItems = workItems.filter((item) => item.clientId === clientId);
  const activeWorkItems = clientWorkItems.filter((item) => item.pipelineStatusLabel !== "Done");
  const contextText = client.structuredContext
    ? JSON.stringify(client.structuredContext, null, 2)
    : "No structured context captured yet.";

  return (
    <main className="min-h-screen bg-app">
      <PageHeader
        description={client.description ?? "Operational context for this client account."}
        eyebrow="Client Detail"
        title={client.name}
      >
        <div className="grid w-full grid-cols-3 gap-2 sm:gap-3 xl:min-w-[390px]">
          <MetricCard detail="Visible projects" label="Projects" value={clientProjects.length} />
          <MetricCard detail="Not done" label="Active" tone="dark" value={activeWorkItems.length} />
          <MetricCard detail="Client access" label="Users" value={users.length} />
        </div>
      </PageHeader>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 sm:px-8 xl:grid-cols-[1fr_380px] lg:px-10">
        <div className="grid gap-6">
          <Panel title="Projects">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">Open project workspaces or review this client on the main board.</p>
              <Link className={buttonClass("secondary")} href={`/work-items?clientIds=${client.id}`}>
                Open main board
              </Link>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {clientProjects.map((project) => (
                <article key={project.id} className="rounded-2xl border border-line bg-blue-soft/60 p-4" data-testid={`project-card-${project.id}`}>
                  <div>
                    <Link className="line-clamp-2 font-bold text-ink hover:text-indigo-600" href={`/projects/${project.id}`}>
                      {project.name}
                    </Link>
                    {project.description ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{project.description}</p>
                    ) : null}
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.min(100, clientWorkItems.filter((item) => item.projectId === project.id).length * 25 + 20)}%` }} />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-muted">
                        {clientWorkItems.filter((item) => item.projectId === project.id).length} work items
                      </span>
                      {admin ? (
                        <form action={archiveProjectAction}>
                          <input name="projectId" type="hidden" value={project.id} />
                          <input name="clientId" type="hidden" value={project.clientId} />
                          <ConfirmSubmitButton className="text-sm font-bold text-rose-600 hover:text-rose-700" message={`Archive ${project.name}?`} type="submit">
                            Archive
                          </ConfirmSubmitButton>
                        </form>
                      ) : null}
                    </div>
                  </div>
                  {admin ? (
                    <details className="inline-edit-control mt-3">
                      <summary className="flex cursor-pointer list-none justify-end">
                        <span className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2 py-1 text-xs font-bold text-muted hover:text-indigo-600">
                          <PencilIcon className="size-3.5" />
                          <span className="edit-label">Edit</span>
                          <span className="cancel-label">Cancel</span>
                        </span>
                      </summary>
                      <form action={updateProjectAction} className="inline-edit-form mt-3">
                        <input name="projectId" type="hidden" value={project.id} />
                        <input name="clientId" type="hidden" value={project.clientId} />
                        <input className={compactFieldClass} defaultValue={project.name} name="name" placeholder="Project name" required />
                        <textarea className={`mt-2 ${fieldClass}`} defaultValue={project.description ?? ""} name="description" placeholder="Background / context" rows={3} />
                        <button className={`mt-3 ${buttonClass("primary")}`} type="submit">
                          Save project
                        </button>
                      </form>
                    </details>
                  ) : null}
                </article>
              ))}
              {clientProjects.length === 0 ? (
                <EmptyState description="Add a project to start organizing work for this client." title="No projects yet" />
              ) : null}
            </div>
          </Panel>

          <Panel>
            <details className="inline-edit-control">
              <summary className="mb-4 flex cursor-pointer list-none items-start justify-between gap-3">
                <span>
                  <span className="block text-lg font-bold tracking-tight text-ink">Client context</span>
                  <span className="mt-1 block text-sm leading-6 text-muted">Background, goals, and structured operating notes for this account.</span>
                </span>
                {admin ? (
                  <span className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-bold text-muted hover:bg-blue-soft hover:text-ink">
                    <PencilIcon />
                    <span className="edit-label">Edit</span>
                    <span className="cancel-label">Cancel</span>
                  </span>
                ) : null}
              </summary>
              <div className="inline-edit-read grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-blue-soft p-4">
                  <h3 className="text-sm font-bold text-ink">Operational summary</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {client.aiSummary ?? "No summary captured yet."}
                  </p>
                </div>
                <div className="rounded-2xl bg-ink p-4">
                  <h3 className="text-sm font-bold text-white">Structured context</h3>
                  <pre className="mt-2 max-h-60 overflow-auto text-xs leading-5 text-white/75">
                    {contextText}
                  </pre>
                </div>
              </div>
              {admin ? (
                <form action={updateClientAction} className="inline-edit-form rounded-2xl border border-line bg-white p-4">
                  <input name="clientId" type="hidden" value={client.id} />
                  <input className={compactFieldClass} defaultValue={client.name} name="name" placeholder="Client name" required />
                  <textarea className={`mt-3 ${fieldClass}`} defaultValue={client.description ?? ""} name="description" placeholder="Background / context" rows={3} />
                  <textarea className={`mt-3 ${fieldClass}`} defaultValue={client.aiSummary ?? ""} name="aiSummary" placeholder="Goals / operating summary" rows={4} />
                  <textarea className={`mt-3 ${fieldClass}`} defaultValue={client.structuredContext ? JSON.stringify(client.structuredContext, null, 2) : ""} name="structuredContext" placeholder='Structured context JSON, for example {"goals":[],"background":""}' rows={6} />
                  <button className={`mt-3 ${buttonClass("primary")}`} type="submit">
                    Save client
                  </button>
                </form>
              ) : null}
            </details>
          </Panel>

          <Panel title="Activity">
            <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line">
              {activity.map((event) => (
                <div key={event.id} className="p-3">
                  <p className="text-sm font-bold text-ink">{event.action.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-xs text-muted">
                    {event.entityType} / {event.createdAt.toLocaleString()}
                  </p>
                </div>
              ))}
              {activity.length === 0 ? (
                <div className="p-4">
                  <EmptyState description="Client and project changes will appear here once work begins." title="No visible activity yet" />
                </div>
              ) : null}
            </div>
          </Panel>
        </div>

        <aside className="grid content-start gap-4">
          <Panel>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-ink">Contacts</h2>
              <Badge>{users.length}</Badge>
            </div>
            <div className="mt-3 grid gap-3">
              {users.map((user) => (
                <details key={user.id} className="inline-edit-control rounded-2xl border border-line p-3">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-ink">{user.name ?? user.email}</span>
                      <span className="block truncate text-xs text-muted">{user.email}</span>
                      <span className="mt-2 block text-xs text-soft">{user.role} / added {user.createdAt.toLocaleDateString()}</span>
                    </span>
                    {admin ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-line bg-white px-2 py-1 text-xs font-bold text-muted hover:text-indigo-600">
                        <PencilIcon className="size-3.5" />
                        <span className="edit-label">Edit</span>
                        <span className="cancel-label">Cancel</span>
                      </span>
                    ) : null}
                  </summary>
                  {admin ? (
                    <form action={updateClientUserAction} className="inline-edit-form mt-3 rounded-2xl border border-line bg-white p-3">
                      <input name="clientId" type="hidden" value={client.id} />
                      <input name="userId" type="hidden" value={user.id} />
                      <input className={compactFieldClass} defaultValue={user.email} name="email" type="email" />
                      <input className={`mt-2 ${compactFieldClass}`} defaultValue={user.name ?? ""} name="name" placeholder="Name" />
                      <div className="mt-3 flex gap-2">
                        <button className={buttonClass("secondary")} type="submit">
                          Save
                        </button>
                        <ConfirmSubmitButton className={buttonClass("danger")} formAction={deleteClientUserAction} message={`Delete ${user.email}?`} type="submit">
                          Delete
                        </ConfirmSubmitButton>
                      </div>
                    </form>
                  ) : null}
                </details>
              ))}
              {users.length === 0 ? (
                <p className="text-sm text-muted">No client users yet. Use the global Add menu to invite one.</p>
              ) : null}
            </div>
          </Panel>
        </aside>
      </section>
    </main>
  );
}
