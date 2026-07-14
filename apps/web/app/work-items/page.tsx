import { createPrismaWorkItemRepository, prisma } from "@digicolony/db";
import {
  listVisibleWorkItemProjects,
  listVisibleWorkItems,
  type Principal
} from "@digicolony/shared";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { principalFromSession } from "../../src/auth/principal";
import { EmptyState } from "../components/ui";
import { WorkItemBoard } from "./WorkItemBoard";
import { WorkItemFilters } from "./WorkItemFilters";
import { changeWorkItemStatusAction } from "./actions";

function isAdmin(principal: Principal): boolean {
  return principal.kind === "user" && principal.user.role === "ADMIN";
}

function toArray(value: string | readonly string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return typeof value === "string" ? [value] : [...value];
}

export default async function WorkItemsPage({
  searchParams
}: {
  searchParams: Promise<{
    clientId?: string | readonly string[];
    clientIds?: string | readonly string[];
    projectId?: string | readonly string[];
    projectIds?: string | readonly string[];
    q?: string;
    type?: string | readonly string[];
    view?: string;
  }>;
}) {
  return <WorkItemsPageContent searchParams={searchParams} />;
}

async function WorkItemsPageContent({
  searchParams
}: {
  searchParams?: Promise<{
    clientId?: string | readonly string[];
    clientIds?: string | readonly string[];
    projectId?: string | readonly string[];
    projectIds?: string | readonly string[];
    q?: string;
    type?: string | readonly string[];
    view?: string;
  }>;
} = {}) {
  const filters = searchParams ? await searchParams : {};
  const selectedClientIds = [
    ...toArray(filters.clientId),
    ...toArray(filters.clientIds)
  ].filter(Boolean);
  const selectedProjectIds = [
    ...toArray(filters.projectId),
    ...toArray(filters.projectIds)
  ].filter(Boolean);
  const query = filters.q?.trim() ?? "";
  const selectedTypes = toArray(filters.type).filter(Boolean);
  const view = filters.view === "list" ? "list" : "board";
  const session = await auth();
  const principal = principalFromSession(session);

  if (!principal) {
    redirect("/sign-in");
  }

  const repository = createPrismaWorkItemRepository(prisma);
  const [items, projects, statuses] = await Promise.all([
    listVisibleWorkItems(repository, principal),
    listVisibleWorkItemProjects(repository, principal),
    repository.listPipelineStatuses()
  ]);
  const admin = isAdmin(principal);
  const filteredItems = items.filter((item) => {
    if (query) {
      const haystack = `${item.title} ${item.description} ${item.clientName ?? ""} ${item.projectName ?? ""}`.toLowerCase();

      if (!haystack.includes(query.toLowerCase())) {
        return false;
      }
    }

    if (selectedTypes.length > 0 && !selectedTypes.includes(item.type)) {
      return false;
    }

    if (selectedProjectIds.length > 0 || selectedClientIds.length > 0) {
      return (
        selectedProjectIds.includes(item.projectId) ||
        selectedClientIds.includes(item.clientId)
      );
    }

    return true;
  });
  const clients = Array.from(
    new Map(
      projects.map((project) => [
        project.clientId,
        project.clientName ?? project.clientId
      ])
    ).entries()
  ).sort((left, right) => left[1].localeCompare(right[1]));
  const selectedFilterCount =
    selectedClientIds.length +
    selectedProjectIds.length +
    selectedTypes.length +
    (query ? 1 : 0);
  const clientTree = clients.map(([clientId, clientName]) => {
    const clientProjects = projects.filter((project) => {
      if (project.clientId !== clientId) {
        return false;
      }

      if (selectedProjectIds.length > 0) {
        return selectedProjectIds.includes(project.id);
      }

      if (selectedClientIds.length > 0) {
        return selectedClientIds.includes(project.clientId);
      }

      return true;
    });
    const visibleCount = filteredItems.filter((item) => item.clientId === clientId).length;

    return {
      clientId,
      clientName,
      visibleCount,
      projects: clientProjects.map((project) => ({
        project,
        items: filteredItems.filter((item) => item.projectId === project.id)
      }))
    };
  }).filter((client) => client.projects.length > 0);
  const hierarchyFilterClients = clients.map(([clientId, clientName]) => ({
    clientId,
    clientName,
    projects: projects
      .filter((project) => project.clientId === clientId)
      .map((project) => ({
        id: project.id,
        name: project.name
      }))
  }));

  return (
    <main className="flex min-h-screen flex-col bg-app">
      <section className="border-b border-line bg-surface px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="mr-auto min-w-[190px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">
              {admin ? "Operations board" : "Request tracker"}
            </p>
            <h1 className="text-xl font-bold text-ink">{view === "list" ? "List" : "Board"}</h1>
          </div>
        </div>

        <WorkItemFilters
          clients={hierarchyFilterClients}
          hierarchyLabel={admin ? "Any client or project" : "Any project"}
          query={query}
          searchPlaceholder={admin ? "Search work, client, project" : "Search requests"}
          selectedClientIds={selectedClientIds}
          selectedProjectIds={selectedProjectIds}
          selectedTypes={selectedTypes}
          view={view}
        />
        <p className="mt-2 text-xs text-soft">
          {selectedFilterCount > 0 ? `${selectedFilterCount} filters active` : "Showing all visible work"}
        </p>
        {!admin && view === "board" ? (
          <p className="mt-1 text-xs leading-5 text-muted">
            Reported means we have received it; In Progress means DigiColony is working on it; In Review means it is being checked before completion.
          </p>
        ) : null}
      </section>

      <section className={view === "board" ? "min-h-0 flex-1" : "min-h-0 flex-1 px-3 py-3 sm:px-5"}>
        {view === "board" ? (
          <WorkItemBoard
            admin={admin}
            changeStatusAction={changeWorkItemStatusAction}
            emptyDescription="Your current filters excluded every visible work item. Clear filters or broaden client/project selections."
            emptyTitle="No work items match"
            items={filteredItems}
            showClientName={admin}
            statuses={statuses}
          />
        ) : (
          <div className="h-[calc(100vh-10.5rem)] overflow-auto rounded-2xl border border-line bg-surface shadow-card">
            <div className="sticky top-0 z-10 border-b border-line bg-surface px-4 py-3">
              <h2 className="text-sm font-bold text-ink">List</h2>
              <p className="text-xs text-muted">
                {filteredItems.length} visible items grouped by client and project
              </p>
            </div>
            <div className="divide-y divide-line">
              {clientTree.map((client) => (
                <details key={client.clientId} className="group/client" open>
                  <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 text-left text-sm font-bold text-ink hover:bg-blue-soft">
                    <span className="text-soft transition group-open/client:rotate-90" aria-hidden="true">
                      &gt;
                    </span>
                    {admin ? (
                      <Link className="block min-w-0 truncate text-left hover:text-indigo-600" href={`/clients/${client.clientId}`}>
                        {client.clientName}
                      </Link>
                    ) : (
                      <span className="block min-w-0 truncate text-left">
                        {client.clientName}
                      </span>
                    )}
                    <span className="shrink-0 rounded-full bg-blue-soft px-2 py-0.5 text-xs text-muted">
                      {client.visibleCount}
                    </span>
                  </summary>
                  <div className="bg-[#f7f9fc]">
                    {client.projects.map(({ project, items: projectItems }) => (
                      <details key={project.id} className="group/project border-t border-line" open>
                        <summary className="flex cursor-pointer list-none items-center gap-3 px-8 py-2 text-left text-sm font-semibold text-muted hover:bg-white">
                          <span className="text-soft transition group-open/project:rotate-90" aria-hidden="true">
                            &gt;
                          </span>
                          {admin ? (
                            <Link className="block min-w-0 truncate text-left hover:text-indigo-600" href={`/projects/${project.id}`}>
                              {project.name}
                            </Link>
                          ) : (
                            <span className="block min-w-0 truncate text-left">
                              {project.name}
                            </span>
                          )}
                          <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs text-soft">
                            {projectItems.length}
                          </span>
                        </summary>
                        <div className="divide-y divide-line bg-white">
                          {projectItems.map((item) => (
                            <article
                              key={item.id}
                              className="grid gap-3 px-12 py-3 text-sm transition hover:bg-blue-soft sm:grid-cols-[minmax(0,1fr)_150px_110px]"
                              data-testid={`work-item-row-${item.id}`}
                            >
                              <div className="min-w-0">
                                <Link className="font-bold text-ink hover:text-indigo-600" href={`/work-items/${item.id}`}>
                                  {item.title}
                                </Link>
                                <p className="mt-1 max-w-3xl leading-6 text-muted">{item.description}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-soft">
                                  {admin ? <span>{item.clientName ?? "Unknown client"}</span> : null}
                                  <span>{item.projectName ?? "Unknown project"}</span>
                                </div>
                              </div>
                              <span className="text-muted">{item.pipelineStatusLabel}</span>
                              <span className="text-soft">{item.type}</span>
                            </article>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              ))}
              {filteredItems.length === 0 ? (
                <div className="p-4">
                  <EmptyState
                    actionHref={`/work-items${view === "list" ? "?view=list" : ""}`}
                    actionLabel="Clear filters"
                    description="No rows match the current filters."
                    title="Nothing in the tree"
                  />
                </div>
              ) : null}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
