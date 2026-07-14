import {
  createPrismaWorkItemRepository,
  prisma
} from "@digicolony/db";
import { listVisibleWorkItemProjects } from "@digicolony/shared";
import { redirect } from "next/navigation";
import { auth } from "../../auth";
import { principalFromSession } from "../../src/auth/principal";
import { EmptyState } from "../components/ui";
import { createClientReportAction } from "./actions";
import { ClientReportForm } from "./ClientReportForm";

export default async function ReportPage() {
  const session = await auth();
  const principal = principalFromSession(session);

  if (!principal) {
    redirect("/sign-in");
  }

  const repository = createPrismaWorkItemRepository(prisma);
  const [projects, statuses] = await Promise.all([
    listVisibleWorkItemProjects(repository, principal),
    repository.listPipelineStatuses()
  ]);
  const defaultStatus = statuses.find((status) => status.isDefault) ?? statuses[0];

  if (projects.length === 0) {
    return (
      <main className="min-h-screen bg-app px-4 py-6 sm:px-6 lg:px-8">
        <EmptyState
          description="Your account does not currently have a project available for reporting. Ask DigiColony to connect your account to the right client workspace."
          title="No projects available"
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app">
      <ClientReportForm
        action={createClientReportAction}
        defaultPipelineStatusId={defaultStatus?.id}
        projects={projects}
      />
    </main>
  );
}
