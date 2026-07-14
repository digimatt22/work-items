import { prisma } from "@digicolony/db";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { principalFromSession } from "../../src/auth/principal";
import { Badge, MetricCard, PageHeader, Panel, buttonClass } from "../components/ui";
import { StatusReportCopy } from "./StatusReportCopy";

type ReportItem = {
  clientName: string;
  description: string;
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

function itemCard(item: ReportItem) {
  return (
    <li key={`${item.clientName}-${item.projectName}-${item.title}`} className="rounded-2xl border border-line bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-ink">{item.title}</p>
          <p className="mt-1 text-sm leading-6 text-muted">{shortDescription(item.description)}</p>
        </div>
        <Badge tone={item.type === "BUG" ? "danger" : "primary"}>{item.type}</Badge>
      </div>
      <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-soft">
        {item.clientName} / {item.projectName}
      </p>
      <p className="mt-1 text-xs text-muted">
        {item.statusLabel} / updated {formatDate(item.updatedAt)}
      </p>
    </li>
  );
}

function StatusSection({
  empty,
  items,
  title
}: {
  empty: string;
  items: readonly ReportItem[];
  title: string;
}) {
  return (
    <Panel title={title}>
      {items.length > 0 ? (
        <ul className="grid gap-3">{items.slice(0, MAX_ITEMS_PER_SECTION).map(itemCard)}</ul>
      ) : (
        <p className="text-sm text-muted">{empty}</p>
      )}
    </Panel>
  );
}

export default async function StatusReportPage() {
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

  const records = await prisma.workItem.findMany({
    include: {
      pipelineStatus: { select: { key: true, label: true } },
      project: {
        select: {
          name: true,
          client: { select: { name: true } }
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
    clientName: item.project.client.name,
    description: item.description,
    projectName: item.project.name,
    statusLabel: item.pipelineStatus.label,
    title: item.title,
    type: item.type,
    updatedAt: item.updatedAt
  }));
  const planned = reportItems.filter((item) => item.statusLabel === "Reported");
  const inProgress = reportItems.filter((item) => item.statusLabel === "In Progress" || item.statusLabel === "In Review");
  const completed = reportItems.filter((item) => item.statusLabel === "Done" && item.updatedAt >= recentSince);
  const reportText = buildReportText({
    completed,
    generatedAt,
    inProgress,
    planned
  });

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

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 sm:px-8 xl:grid-cols-[minmax(0,1fr)_420px] lg:px-10">
        <div className="grid gap-6">
          <Panel title="Email-ready copy">
            <StatusReportCopy reportText={reportText} />
          </Panel>
        </div>

        <aside className="grid content-start gap-4">
          <div className="flex flex-wrap gap-2">
            <Link className={buttonClass("secondary")} href="/work-items">
              Open board
            </Link>
            <Link className={buttonClass("secondary")} href="/work-items?view=list">
              Open list
            </Link>
          </div>
          <StatusSection empty="No newly planned work is waiting in Reported." items={planned} title="Planned next" />
          <StatusSection empty="No work is currently marked In Progress or In Review." items={inProgress} title="In progress" />
          <StatusSection empty="No work was completed in the last seven days." items={completed} title="Recently completed" />
        </aside>
      </section>
    </main>
  );
}
