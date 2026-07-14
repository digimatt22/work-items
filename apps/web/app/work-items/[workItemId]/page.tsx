import {
  createLocalStorageProvider,
  createPrismaCollaborationRepository,
  createPrismaWorkItemRepository,
  prisma
} from "@digicolony/db";
import {
  assetConstraints,
  listVisibleAssets,
  listVisibleComments,
  listVisibleWorkItems,
  type Principal
} from "@digicolony/shared";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { principalFromSession } from "../../../src/auth/principal";
import {
  Badge,
  EmptyState,
  Panel
} from "../../components/ui";
import { StatusMoveControls } from "../StatusMoveControls";
import { changeWorkItemStatusAction } from "../actions";
import { AssetDropzone } from "./AssetDropzone";
import { WorkItemComments } from "./WorkItemComments";
import { createCommentAction, uploadAssetAction } from "./actions";

function isAdmin(principal: Principal): boolean {
  return principal.kind === "user" && principal.user.role === "ADMIN";
}

function clientStatusDescription(statusLabel: string): string {
  switch (statusLabel) {
    case "Reported":
      return "We have received this request and will triage it.";
    case "In Progress":
      return "DigiColony is actively working on this request.";
    case "In Review":
      return "This request is being checked before it is marked done.";
    case "Done":
      return "This request is complete for the current review cycle.";
    default:
      return "We will update this status as the request moves forward.";
  }
}

export default async function WorkItemDetailPage({
  params
}: {
  params: Promise<{ workItemId: string }>;
}) {
  const { workItemId } = await params;
  const session = await auth();
  const principal = principalFromSession(session);

  if (!principal) {
    redirect("/sign-in");
  }

  const repository = createPrismaWorkItemRepository(prisma);
  const collaborationRepository = createPrismaCollaborationRepository(
    prisma,
    createLocalStorageProvider(process.env.UPLOADS_DIR ?? "./uploads")
  );
  const item = (await listVisibleWorkItems(repository, principal)).find(
    (candidate) => candidate.id === workItemId
  );

  if (!item) {
    return (
      <main className="min-h-screen bg-app">
        <section className="mx-auto max-w-4xl px-6 py-10">
          <Link className="text-sm font-bold text-indigo-600 hover:underline" href="/work-items">
            Back to board
          </Link>
          <Panel>
            <h1 className="text-2xl font-bold text-ink">Work item not found</h1>
            <p className="mt-2 text-sm text-muted">
              The work item either does not exist or is outside your scope.
            </p>
          </Panel>
        </section>
      </main>
    );
  }

  const admin = isAdmin(principal);
  const [comments, assets, statuses, details, activity] = await Promise.all([
    listVisibleComments(collaborationRepository, principal, workItemId),
    listVisibleAssets(collaborationRepository, principal, workItemId),
    repository.listPipelineStatuses(),
    prisma.workItem.findUnique({
      where: { id: workItemId },
      select: {
        aiSummary: true,
        bugDetails: true,
        featureDetails: true,
        updatedAt: true
      }
    }),
    prisma.activityEvent.findMany({
      where: {
        entityId: workItemId,
        entityType: "WORK_ITEM",
        visibility: admin ? undefined : "USER_VISIBLE"
      },
      orderBy: { createdAt: "desc" },
      take: 8
    })
  ]);

  return (
    <main className="min-h-screen bg-app">
      <section className="border-b border-line bg-surface px-5 py-4 sm:px-8">
        <Link className="text-sm font-bold text-indigo-600 hover:underline" href="/work-items">
          Back to board
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={item.type === "BUG" ? "danger" : "primary"}>{item.type}</Badge>
              <span className="text-xl font-bold text-soft">#{item.id.slice(0, 8)}</span>
            </div>
            <h1 className="mt-2 max-w-5xl break-words text-2xl font-bold leading-tight text-ink">
              {item.title}
            </h1>
          </div>
        </div>
      </section>

      <section className="grid w-full gap-4 px-5 py-4 sm:px-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid content-start gap-4">
          <Panel title={admin ? "Work record" : "Request details"}>
            <p className="text-sm leading-7 text-muted">
              {item.description || (admin ? "Click to add description." : "No request summary captured yet.")}
            </p>

            <div className="mt-6">
              {details?.bugDetails ? (
                <div className="grid gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-soft">
                      {admin ? "Steps to reproduce" : "What to try"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {details.bugDetails.stepsToReproduce || "Not captured."}
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-soft">
                        {admin ? "Expected" : "Expected result"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {details.bugDetails.expectedBehavior || "Not captured."}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-soft">
                        {admin ? "Actual" : "What happened"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {details.bugDetails.actualBehavior || "Not captured."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : details?.featureDetails ? (
                <div className="grid gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-soft">
                      {admin ? "User story" : "Who needs this and why"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {details.featureDetails.userStory || "Not captured."}
                    </p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-soft">
                        {admin ? "Acceptance criteria" : "What would make this complete"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {details.featureDetails.acceptanceCriteria || "Not captured."}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-soft">
                        {admin ? "Business value" : "Why it matters"}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {details.featureDetails.businessValue || "Not captured."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  description={admin ? "Type-specific fields were not found for this record." : "Additional request fields were not found."}
                  title={admin ? "Details missing" : "Request details missing"}
                />
              )}
            </div>

            <AssetDropzone
              action={uploadAssetAction}
              allowedExtensions={assetConstraints.allowedExtensions}
              maxFileSizeBytes={assetConstraints.maxFileSizeBytes}
              workItemId={item.id}
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {assets.map((asset) => (
                <div key={asset.id} className="flex max-w-64 items-center gap-2 rounded-md border border-line bg-white px-3 py-2">
                  <span className="grid size-8 shrink-0 place-items-center rounded bg-blue-soft text-[10px] font-bold text-indigo-600">
                    FILE
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-ink">{asset.filename}</p>
                    <p className="truncate text-xs text-soft">{asset.contentType}</p>
                  </div>
                </div>
              ))}
              {assets.length === 0 ? (
                <p className="text-xs text-soft">No assets attached.</p>
              ) : null}
            </div>
          </Panel>

          <Panel title="Comments">
            <WorkItemComments
              action={createCommentAction}
              comments={comments.map((comment) => ({
                authorId: comment.authorId,
                body: comment.body,
                createdAt: comment.createdAt.toLocaleString(),
                id: comment.id
              }))}
              workItemId={item.id}
            />
          </Panel>
        </div>

        <aside className="grid content-start gap-4">
          <Panel title="Status">
            {admin ? (
              <StatusMoveControls
                action={changeWorkItemStatusAction}
                currentStatusId={item.pipelineStatusId}
                statuses={statuses}
                workItemId={item.id}
              />
            ) : (
              <div>
                <Badge>{item.pipelineStatusLabel}</Badge>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {clientStatusDescription(item.pipelineStatusLabel)}
                </p>
              </div>
            )}
          </Panel>

          <Panel title="Info">
            <dl className="divide-y divide-line text-sm">
              <div className="grid grid-cols-[110px_1fr] gap-3 py-3">
                <dt className="font-semibold text-muted">Client</dt>
                <dd className="min-w-0 truncate font-semibold text-ink">
                  {admin ? (
                    <Link className="text-indigo-600 hover:underline" href={`/clients/${item.clientId}`}>
                      {item.clientName ?? item.clientId}
                    </Link>
                  ) : (
                    item.clientName ?? item.clientId
                  )}
                </dd>
              </div>
              <div className="grid grid-cols-[110px_1fr] gap-3 py-3">
                <dt className="font-semibold text-muted">Project</dt>
                <dd className="min-w-0 truncate font-semibold text-ink">
                  {admin ? (
                    <Link className="text-indigo-600 hover:underline" href={`/projects/${item.projectId}`}>
                      {item.projectName ?? item.projectId}
                    </Link>
                  ) : (
                    item.projectName ?? item.projectId
                  )}
                </dd>
              </div>
              {[
                ["Type", item.type],
                [admin ? "State" : "Status", item.pipelineStatusLabel],
                ["Created", item.createdAt.toLocaleDateString()],
                ["Updated", details?.updatedAt.toLocaleDateString() ?? item.createdAt.toLocaleDateString()]
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[110px_1fr] gap-3 py-3">
                  <dt className="font-semibold text-muted">{label}</dt>
                  <dd className="min-w-0 truncate font-semibold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          {admin ? (
            <Panel title="Operational summary">
              <p className="text-sm leading-6 text-muted">
                {details?.aiSummary ?? "No internal summary captured yet."}
              </p>
            </Panel>
          ) : null}

          <Panel title="Activity">
            <div className="divide-y divide-line">
              {activity.map((event) => (
                <div key={event.id} className="py-3">
                  <p className="text-sm font-bold text-ink">{event.action.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-xs text-muted">{event.createdAt.toLocaleString()}</p>
                </div>
              ))}
              {activity.length === 0 ? (
                <EmptyState
                  description={admin ? "Status and work item changes will appear here." : "Request updates will appear here."}
                  title="No activity yet"
                />
              ) : null}
            </div>
          </Panel>
        </aside>
      </section>
    </main>
  );
}
