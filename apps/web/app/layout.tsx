import type { Metadata } from "next";
import { createPrismaWorkItemRepository, createPrismaWorkspaceRepository, prisma } from "@digicolony/db";
import {
  listVisibleWorkItemProjects,
  listWorkspaceClients
} from "@digicolony/shared";
import { auth } from "../auth";
import { principalFromSession } from "../src/auth/principal";
import { signOutAction } from "./actions";
import { AppShell } from "./components/AppShell";
import { createWorkItemAction } from "./work-items/actions";
import {
  createClientAction,
  createClientUserAction,
  createProjectAction
} from "./workspaces/actions";
import "./globals.css";

export const metadata: Metadata = {
  title: "DigiColony Client Operations",
  description: "AI-first client operations platform."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const signedIn = Boolean(session?.user);
  const principal = principalFromSession(session);
  const workspaceRepository = createPrismaWorkspaceRepository(prisma);
  const workItemRepository = createPrismaWorkItemRepository(prisma);
  const [clients, projects, statuses] = principal
    ? await Promise.all([
        listWorkspaceClients(workspaceRepository, principal),
        listVisibleWorkItemProjects(workItemRepository, principal),
        workItemRepository.listPipelineStatuses()
      ])
    : [[], [], []];

  return (
    <html lang="en">
      <body>
        {signedIn ? (
          <AppShell
            clients={clients}
            createClientAction={createClientAction}
            createClientUserAction={createClientUserAction}
            createProjectAction={createProjectAction}
            createWorkItemAction={createWorkItemAction}
            email={session?.user?.email}
            name={session?.user?.name}
            projects={projects}
            role={session?.user?.role}
            signOutAction={signOutAction}
            statuses={statuses}
          >
            {children}
          </AppShell>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
