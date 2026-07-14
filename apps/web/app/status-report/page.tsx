import { prisma } from "@digicolony/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { principalFromSession } from "../../src/auth/principal";
import { MetricCard, PageHeader, Panel, buttonClass } from "../components/ui";
import { StatusReportCopy } from "./StatusReportCopy";

type SearchFilters = {
  clientId?: string | readonly string[];
  clientIds?: string | readonly string[];
  projectId?: string | readonly string[];
  projectIds?: string | readonly string[];
  q?: string;
  type?: string | readonly string[];
};

type ReportItem = {
  clientId: string;
  clientName: string;
  description: string;
  projectId: string;
  projectName: string;
  statusLabel: string;
  title: string;
  type: string;
  updatedAt: Date;
};

const MAX_ITEMS_PER_SECTION = 6;

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
}

function shortDescription(description: string): string {
  const [firstSentence] = description.split(/(?<=[.!?])\s+/);

  return (firstSentence || description).trim();
}

function itemLine(item: ReportItem): string {
  return `- ${item.title} (${item.clientName} / ${item.projectName}) - ${shortDescription(item.description)}`;
}

function sectionText(title: string, items: readonly ReportItem[], empty: string): string {
  const visibleItems = items.slice(0, MAX_ITEMS_PER_SECTION);
  const hiddenCount = Math.max(0, items.length - visibleItems.length);
  const lines = visibleItems.length > 0 ? visibleItems.map(itemLine) : [`- ${empty}`];

  if (hiddenCount > 0) {
    lines.push(`- ${hiddenCount} more item${hiddenCount === 1 ? "" : "s"} not shown in this concise summary.`);
  }

  return [`${title}:`, ...lines].join("\n");
}

function toArray(value: string | readonly string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  return typeof value === "string" ? [value] : [...value];
}

function buildBoardHref({
  query,
  selectedClientIds,
  selectedProjectIds,
  selectedTypes
}: {
  query: string;
  selectedClientIds: readonly string[];
  selectedProjectIds: readonly string[];
  selectedTypes: readonly string[];
}): string {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  selectedClientIds.forEach((clientId) => params.append("clientIds", clientId));
  selectedProjectIds.forEach((projectId) => params.append("projectIds", projectId));
  selectedTypes.forEach((type) => params.append("type", type));

  const search = params.toString();

  return search ? `/work-items?${search}` : "/work-items";
}

function buildReportText({
  completed,
  generatedAt,
  inProgress,
  planned
}: {
  completed: readonly ReportItem[];
  generatedAt: Date;
  inProgress: readonly ReportItem[];
  planned: readonly ReportItem[];
}): string {
  return [
    `Subject: Weekly status update - ${formatDate(generatedAt)}`,
    "",
    "Hi team,",
    "",
    "Here is the concise weekly status recap:",
    "",
    sectionText("Planned next", planned, "No newly planned work is waiting in Reported."),
    "",
    sectionText("In progress", inProgress, "No work is currently marked In Progress or In Review."),
    "",
    sectionText("Recently completed", completed, "No work was completed in the last seven days."),
    "",
    "Reply with any priority changes, missing context, or decisions needed before the next update.",
    "",
    "Thanks,"
  ].join("\n");
}

export default async function StatusReportPage({
  searchParams
}: {
  searchParams: Promise<SearchFilters>;
}) {
  const filters = await searchParams;
  const session = await auth();
  const principal = principalFromSession(session);

  if (!principal) {
    redirect("/sign-in");
  }

  if (principal.kind !== "user" || principal.user.role !== "ADMIN") {
    redirect("/work-items");
  }

  const generatedAt = new Date();
  const recentSince = new Date(generatedAt);
  recentSince.setDate(recentSince.getDate() - 7);
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
  const activeFilterCount =
    selectedClientIds.length +
    selectedProjectIds.length +
    selectedTypes.length +
    (query ? 1 : 0);

  const records = await prisma.workItem.findMany({
    include: {
      pipelineStatus: { select: { key: true, label: true } },
      project: {
        select: {
          id: true,
          name: true,
          client: { select: { id: true, name: true } }
        }
      }
    },
    orderBy: [{ pipelineStatus: { sortOrder: "asc" } }, { updatedAt: "desc" }],
    where: {
      archivedAt: null,
      project: {
        archivedAt: null,
        client: { archivedAt: null }
      }
    }
  });

  const reportItems: ReportItem[] = records.map((item) => ({
    clientId: item.project.client.id,
    clientName: item.project.client.name,
    description: item.description,
    projectId: item.project.id,
    projectName: item.project.name,
    statusLabel: item.pipelineStatus.label,
    title: item.title,
    type: item.type,
    updatedAt: item.updatedAt
  }));
  const filteredReportItems = reportItems.filter((item) => {
    if (query) {
      const haystack = `${item.title} ${item.description} ${item.clientName} ${item.projectName}`.toLowerCase();

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
  const planned = filteredReportItems.filter((item) => item.statusLabel === "Reported");
  const inProgress = filteredReportItems.filter((item) => item.statusLabel === "In Progress" || item.statusLabel === "In Review");
  const completed = filteredReportItems.filter((item) => item.statusLabel === "Done" && item.updatedAt >= recentSince);
  const reportText = buildReportText({
    completed,
    generatedAt,
    inProgress,
    planned
  });
  const boardHref = buildBoardHref({
    query,
    selectedClientIds,
    selectedProjectIds,
    selectedTypes
  });
  const filterSummary = activeFilterCount > 0
    ? `Using ${activeFilterCount} active board filter${activeFilterCount === 1 ? "" : "s"} for this email preview.`
    : "Using all visible work items for this email preview.";

  return (
    <main className="min-h-screen bg-app">
      <PageHeader
        description="Generate a concise weekly recap for email copy/paste. This first version does not send email automatically."
        eyebrow="Weekly status"
        title="Status report"
      >
        <div className="grid w-full grid-cols-3 gap-2 sm:gap-3 xl:min-w-[390px]">
          <MetricCard detail="Reported" label="Planned" value={planned.length} />
          <MetricCard detail="In progress or review" label="In progress" tone="dark" value={inProgress.length} />
          <MetricCard detail="Last 7 days" label="Done" value={completed.length} />
        </div>
      </PageHeader>

      <section className="mx-auto grid w-full max-w-5xl gap-4 px-5 py-6 sm:px-8 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm leading-6 text-muted">{filterSummary}</p>
          <Link className={buttonClass("secondary")} href={boardHref}>
            Open board
          </Link>
        </div>
        <Panel title="Email-ready copy">
          <StatusReportCopy reportText={reportText} />
        </Panel>
      </section>
    </main>
  );
}
