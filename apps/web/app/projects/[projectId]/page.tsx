import {
  createConfiguredStorageProvider,
  createPrismaProjectDeliverableRepository,
  createPrismaWorkItemRepository,
  prisma,
} from "@digicolony/db";
import {
  listProjectDeliverables,
  listVisibleWorkItemProjects,
  listVisibleWorkItems,
  type Principal,
} from "@digicolony/shared";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { principalFromSession } from "../../../src/auth/principal";
import {
  Badge,
  EmptyState,
  MetricCard,
  PageHeader,
  Panel,
  PencilIcon,
  buttonClass,
  compactFieldClass,
  fieldClass,
} from "../../components/ui";
import { updateProjectAction } from "../../workspaces/actions";
import { ProjectDeliverables } from "./ProjectDeliverables";
import {
  createDeliverableShareAction,
  revokeDeliverableShareAction,
  uploadProjectDeliverableAction,
} from "./deliverable-actions";

function isAdmin(principal: Principal): boolean {
  return principal.kind === "user" && principal.user.role === "ADMIN";
}

export default async function ProjectWorkspacePage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const session = await auth();
  const principal = principalFromSession(session);

  if (!principal) {
    redirect("/sign-in");
  }

  const admin = isAdmin(principal);

  if (!admin) {
    redirect(`/work-items?projectId=${projectId}`);
  }

  const repository = createPrismaWorkItemRepository(prisma);
  const deliverableRepository = createPrismaProjectDeliverableRepository(
    prisma,
    createConfiguredStorageProvider(),
  );
  const [projects, allItems, projectDetails, deliverables] = await Promise.all([
    listVisibleWorkItemProjects(repository, principal),
    listVisibleWorkItems(repository, principal),
    prisma.project.findUnique({
      where: { id: projectId },
      select: {
        aiSummary: true,
        description: true,
        structuredContext: true,
        updatedAt: true,
      },
    }),
    listProjectDeliverables(deliverableRepository, principal, projectId),
  ]);
  const project = projects.find((candidate) => candidate.id === projectId);
  const projectItems = allItems.filter((item) => item.projectId === projectId);
  const activeCount = projectItems.filter(
    (item) => item.pipelineStatusLabel !== "Done",
  ).length;
  const doneCount = projectItems.filter(
    (item) => item.pipelineStatusLabel === "Done",
  ).length;
  const projectContextText = projectDetails?.structuredContext
    ? JSON.stringify(projectDetails.structuredContext, null, 2)
    : "No structured context captured yet.";
  const hasProjectContext = Boolean(
    projectDetails?.description ||
    projectDetails?.aiSummary ||
    projectDetails?.structuredContext,
  );

  if (!project) {
    return (
      <main className="min-h-screen bg-app">
        <section className="mx-auto max-w-4xl px-6 py-10">
          <Link
            className="text-sm font-bold text-indigo-600 hover:underline"
            href="/clients"
          >
            Back to clients
          </Link>
          <Panel>
            <h1 className="text-2xl font-bold text-ink">Project not found</h1>
            <p className="mt-2 text-sm text-muted">
              The project either does not exist or is outside your client scope.
            </p>
          </Panel>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app">
      <PageHeader
        description="Review project context and jump to the main board with this project already filtered."
        eyebrow="Project Workspace"
        title={project.name}
      >
        <div className="grid w-full grid-cols-3 gap-2 sm:gap-3 xl:min-w-[390px]">
          <MetricCard
            detail={project.clientName ?? project.clientId}
            label="Total"
            value={projectItems.length}
          />
          <MetricCard
            detail="Not done"
            label="Open work"
            tone="dark"
            value={activeCount}
          />
          <MetricCard detail="Closed" label="Done" value={doneCount} />
        </div>
      </PageHeader>

      <section className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <div className="grid gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm">
              <Link
                className="font-bold text-indigo-600 hover:underline"
                href="/clients"
              >
                Clients
              </Link>
              <span className="text-soft">/</span>
              <Link
                className="max-w-[28ch] truncate font-bold text-indigo-600 hover:underline"
                href={`/clients/${project.clientId}`}
              >
                {project.clientName ?? project.clientId}
              </Link>
            </div>
            <Link
              className={buttonClass("secondary")}
              href={`/work-items?projectId=${project.id}`}
            >
              Open main board
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <Panel>
              <details className="inline-edit-control">
                <summary className="mb-4 flex cursor-pointer list-none items-start justify-between gap-3">
                  <span>
                    <span className="block text-lg font-bold tracking-tight text-ink">
                      Project context
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-muted">
                      Background, goals, and structured operating notes for this
                      project.
                    </span>
                  </span>
                  {admin ? (
                    <span className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-sm font-bold text-muted hover:bg-blue-soft hover:text-ink">
                      <PencilIcon />
                      <span className="edit-label">Edit</span>
                      <span className="cancel-label">Cancel</span>
                    </span>
                  ) : null}
                </summary>
                <div className="inline-edit-read">
                  {hasProjectContext ? (
                    <>
                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl bg-blue-soft p-4">
                          <h2 className="text-sm font-bold text-ink">
                            Background
                          </h2>
                          <p className="mt-2 text-sm leading-6 text-muted">
                            {projectDetails?.description ??
                              "No project background captured yet."}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-blue-soft p-4">
                          <h2 className="text-sm font-bold text-ink">Goals</h2>
                          <p className="mt-2 text-sm leading-6 text-muted">
                            {projectDetails?.aiSummary ??
                              "No goals or operating summary captured yet."}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 rounded-2xl bg-ink p-4">
                        <h2 className="text-sm font-bold text-white">
                          Structured context
                        </h2>
                        <pre className="mt-2 max-h-48 overflow-auto text-xs leading-5 text-white/75">
                          {projectContextText}
                        </pre>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-line p-4">
                      <EmptyState
                        description="Add background, goals, or structured notes when this project needs more launch context."
                        title="No project context yet"
                      />
                    </div>
                  )}
                </div>
                {admin ? (
                  <form
                    action={updateProjectAction}
                    className="inline-edit-form rounded-2xl border border-line bg-white p-4"
                  >
                    <input name="projectId" type="hidden" value={project.id} />
                    <input
                      name="clientId"
                      type="hidden"
                      value={project.clientId}
                    />
                    <input
                      className={compactFieldClass}
                      defaultValue={project.name}
                      name="name"
                      placeholder="Project name"
                      required
                    />
                    <textarea
                      className={`mt-3 ${fieldClass}`}
                      defaultValue={projectDetails?.description ?? ""}
                      name="description"
                      placeholder="Background / context"
                      rows={3}
                    />
                    <textarea
                      className={`mt-3 ${fieldClass}`}
                      defaultValue={projectDetails?.aiSummary ?? ""}
                      name="aiSummary"
                      placeholder="Goals / operating summary"
                      rows={4}
                    />
                    <textarea
                      className={`mt-3 ${fieldClass}`}
                      defaultValue={
                        projectDetails?.structuredContext
                          ? JSON.stringify(
                              projectDetails.structuredContext,
                              null,
                              2,
                            )
                          : ""
                      }
                      name="structuredContext"
                      placeholder='Structured context JSON, for example {"goals":[],"background":""}'
                      rows={6}
                    />
                    <button
                      className={`mt-3 ${buttonClass("primary")}`}
                      type="submit"
                    >
                      Save project
                    </button>
                  </form>
                ) : null}
              </details>
            </Panel>

            <Panel>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-ink">Work</h2>
                <Badge>{projectItems.length}</Badge>
              </div>
              <Link
                className={`mt-4 w-full ${buttonClass("primary")}`}
                href={`/work-items?projectId=${project.id}`}
              >
                Review on main board
              </Link>
              <div className="mt-4 grid gap-3">
                {projectItems.slice(0, 5).map((item) => (
                  <Link
                    key={item.id}
                    className="rounded-2xl border border-line p-3 hover:bg-blue-soft"
                    href={`/work-items/${item.id}`}
                  >
                    <p className="line-clamp-2 text-sm font-bold text-ink">
                      {item.title}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      {item.pipelineStatusLabel} / {item.type}
                    </p>
                  </Link>
                ))}
                {projectItems.length === 0 ? (
                  <p className="text-sm text-muted">
                    No work items yet. Use the global Add menu to create one.
                  </p>
                ) : null}
              </div>
            </Panel>
          </div>

          <Panel>
            <ProjectDeliverables
              deliverables={deliverables}
              projectId={project.id}
              revokeAction={revokeDeliverableShareAction}
              shareAction={createDeliverableShareAction}
              uploadAction={uploadProjectDeliverableAction}
            />
          </Panel>
        </div>
      </section>
    </main>
  );
}
