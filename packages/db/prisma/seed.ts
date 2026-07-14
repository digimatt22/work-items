import { hash } from "bcryptjs";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const defaultPassword = process.env.SEED_DEFAULT_PASSWORD ?? "ChangeMe123!";

async function upsertUser(input: {
  email: string;
  name: string;
  role: UserRole;
  clientId?: string;
}) {
  const user = await prisma.user.upsert({
    where: { email: input.email },
    create: {
      email: input.email,
      name: input.name,
      role: input.role,
      clientId: input.clientId
    },
    update: {
      name: input.name,
      role: input.role,
      clientId: input.clientId
    }
  });

  await prisma.passwordCredential.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      passwordHash: await hash(defaultPassword, 12)
    },
    update: {}
  });

  return user;
}

async function main() {
  const digicolonyClient = await prisma.client.upsert({
    where: { id: "seed-client-digicolony-demo" },
    create: {
      id: "seed-client-digicolony-demo",
      name: "DigiColony Demo Client",
      description: "Seed client for local MVP launch-readiness review.",
      aiSummary: "Preparing a small client operations portal pilot with clear reporting, request review, and weekly status visibility.",
      structuredContext: {
        goals: [
          "Make request intake simple for client stakeholders",
          "Keep active work visible without exposing internal AI or admin activity"
        ],
        cadence: "Weekly launch-readiness review"
      }
    },
    update: {
      name: "DigiColony Demo Client",
      description: "Seed client for local MVP launch-readiness review.",
      aiSummary: "Preparing a small client operations portal pilot with clear reporting, request review, and weekly status visibility.",
      structuredContext: {
        goals: [
          "Make request intake simple for client stakeholders",
          "Keep active work visible without exposing internal AI or admin activity"
        ],
        cadence: "Weekly launch-readiness review"
      }
    }
  });

  const northstarClient = await prisma.client.upsert({
    where: { id: "seed-client-northstar" },
    create: {
      id: "seed-client-northstar",
      name: "Northstar Clinic Group",
      description: "Healthcare services client reviewing intake and reporting workflows."
    },
    update: {
      name: "Northstar Clinic Group",
      description: "Healthcare services client reviewing intake and reporting workflows."
    }
  });

  const atlasClient = await prisma.client.upsert({
    where: { id: "seed-client-atlas" },
    create: {
      id: "seed-client-atlas",
      name: "Atlas Field Services",
      description: "Operations client with field team coordination and asset review needs."
    },
    update: {
      name: "Atlas Field Services",
      description: "Operations client with field team coordination and asset review needs."
    }
  });

  const admin = await upsertUser({
    email: "admin@digicolony.local",
    name: "DigiColony Admin",
    role: UserRole.ADMIN
  });

  const clientUser = await upsertUser({
    email: "client@digicolony.local",
    name: "Demo Client User",
    role: UserRole.CLIENT_USER,
    clientId: digicolonyClient.id
  });

  const portalProject = await prisma.project.upsert({
    where: { id: "seed-project-client-portal" },
    create: {
      id: "seed-project-client-portal",
      clientId: digicolonyClient.id,
      name: "Client Portal MVP",
      description: "Seed project for reviewing the basic client operations workflow.",
      aiSummary: "Pilot the client-facing reporting and request visibility workflow before inviting a limited group.",
      structuredContext: {
        audience: "Client stakeholders and DigiColony admins",
        launchCriteria: [
          "Client reports create visible requests",
          "Internal admin work stays hidden from client users",
          "Board and list views stay readable on desktop and mobile"
        ]
      }
    },
    update: {
      clientId: digicolonyClient.id,
      name: "Client Portal MVP",
      description: "Seed project for reviewing the basic client operations workflow.",
      aiSummary: "Pilot the client-facing reporting and request visibility workflow before inviting a limited group.",
      structuredContext: {
        audience: "Client stakeholders and DigiColony admins",
        launchCriteria: [
          "Client reports create visible requests",
          "Internal admin work stays hidden from client users",
          "Board and list views stay readable on desktop and mobile"
        ]
      }
    }
  });

  const analyticsProject = await prisma.project.upsert({
    where: { id: "seed-project-analytics" },
    create: {
      id: "seed-project-analytics",
      clientId: digicolonyClient.id,
      name: "Executive Reporting Dashboard",
      description: "A lightweight reporting workspace for project health, blockers, and launch readiness."
    },
    update: {
      clientId: digicolonyClient.id,
      name: "Executive Reporting Dashboard",
      description: "A lightweight reporting workspace for project health, blockers, and launch readiness."
    }
  });

  const intakeProject = await prisma.project.upsert({
    where: { id: "seed-project-northstar-intake" },
    create: {
      id: "seed-project-northstar-intake",
      clientId: northstarClient.id,
      name: "Patient Intake Modernization",
      description: "Improve intake handoff quality, form clarity, and follow-up tracking."
    },
    update: {
      clientId: northstarClient.id,
      name: "Patient Intake Modernization",
      description: "Improve intake handoff quality, form clarity, and follow-up tracking."
    }
  });

  const dispatchProject = await prisma.project.upsert({
    where: { id: "seed-project-atlas-dispatch" },
    create: {
      id: "seed-project-atlas-dispatch",
      clientId: atlasClient.id,
      name: "Dispatch Operations Board",
      description: "Track field service requests, approvals, and release coordination."
    },
    update: {
      clientId: atlasClient.id,
      name: "Dispatch Operations Board",
      description: "Track field service requests, approvals, and release coordination."
    }
  });

  const statuses = [
    { key: "REPORTED", label: "Reported", color: "#64748b", sortOrder: 10, isDefault: true },
    { key: "IN_PROGRESS", label: "In Progress", color: "#1f7a8c", sortOrder: 20 },
    { key: "IN_REVIEW", label: "In Review", color: "#7c3aed", sortOrder: 30 },
    { key: "DONE", label: "Done", color: "#15803d", sortOrder: 40 }
  ];

  const statusByKey = new Map<string, { id: string }>();

  for (const status of statuses) {
    const savedStatus = await prisma.pipelineStatus.upsert({
      where: { key: status.key },
      create: status,
      update: status
    });

    statusByKey.set(status.key, savedStatus);
  }

  const workItems = [
    {
      id: "seed-client-report-bug",
      projectId: portalProject.id,
      type: "BUG" as const,
      title: "Login page error blocks client review",
      description: "The client review group needs a clear path to sign in before the pilot starts.",
      statusKey: "REPORTED",
      creatorId: clientUser.id,
      reporterId: clientUser.id,
      bugDetails: {
        stepsToReproduce: "Open the client portal sign-in page and submit known pilot credentials.",
        expectedBehavior: "The request board or report form opens after sign-in.",
        actualBehavior: "The user sees an error and cannot continue."
      }
    },
    {
      id: "seed-client-report-feature",
      projectId: portalProject.id,
      type: "FEATURE" as const,
      title: "Weekly request summary for launch reviewers",
      description: "Client stakeholders want a concise weekly summary of new requests, blockers, and completed work.",
      statusKey: "IN_PROGRESS",
      creatorId: clientUser.id,
      reporterId: clientUser.id,
      featureDetails: {
        userStory: "As a client stakeholder, I want a weekly request summary so I can prepare for launch review meetings.",
        acceptanceCriteria: "The summary lists new requests, blockers, items needing feedback, and recently completed work.",
        businessValue: "Keeps the pilot group aligned without asking everyone to inspect the board every day."
      }
    },
    {
      id: "seed-work-item-client-nav",
      projectId: portalProject.id,
      type: "FEATURE" as const,
      title: "Create admin workspace overview",
      description: "Admins need a concise operating view of clients, projects, and active work before drilling into detail.",
      statusKey: "IN_PROGRESS",
      creatorId: admin.id,
      reporterId: admin.id,
      featureDetails: {
        userStory: "As an admin, I want to scan client workspaces quickly so I can decide where to focus.",
        acceptanceCriteria: "Shows active clients, project counts, recent activity, and clear links into work items.",
        businessValue: "Reduces context switching during weekly client operations reviews."
      }
    },
    {
      id: "seed-work-item-client-user-visibility",
      projectId: portalProject.id,
      type: "BUG" as const,
      title: "Client users should not see AI action activity",
      description: "Client-facing activity views must hide AI agent actions while preserving admin auditability.",
      statusKey: "IN_REVIEW",
      creatorId: admin.id,
      reporterId: admin.id,
      bugDetails: {
        stepsToReproduce: "Sign in as a client user and inspect project activity.",
        expectedBehavior: "Only user-visible human/system events are shown.",
        actualBehavior: "Review the activity filtering before enabling client review."
      }
    },
    {
      id: "seed-work-item-client-workflow",
      projectId: portalProject.id,
      type: "FEATURE" as const,
      title: "Support inline work item status movement",
      description: "Admins need to move cards through Reported, In Progress, In Review, and Done without leaving the board.",
      statusKey: "REPORTED",
      creatorId: admin.id,
      reporterId: admin.id,
      featureDetails: {
        userStory: "As an admin, I want fast status changes so the board stays current during review calls.",
        acceptanceCriteria: "Each card exposes an admin-only status control and records an activity event.",
        businessValue: "Makes the MVP useful for real project triage sessions."
      }
    },
    {
      id: "seed-work-item-dashboard-health",
      projectId: analyticsProject.id,
      type: "FEATURE" as const,
      title: "Add launch readiness summary strip",
      description: "A compact status strip should show active items, review items, and completed items for each workspace.",
      statusKey: "REPORTED",
      creatorId: admin.id,
      reporterId: admin.id,
      featureDetails: {
        userStory: "As an admin, I want quick health indicators before opening a project.",
        acceptanceCriteria: "Summary counts derive from persisted work items and remain client-scoped.",
        businessValue: "Improves executive review readiness without adding a separate reporting product."
      }
    },
    {
      id: "seed-work-item-intake-required-fields",
      projectId: intakeProject.id,
      type: "BUG" as const,
      title: "Intake form accepts missing insurance contact",
      description: "Northstar's intake workflow should flag missing insurance contact details before submission.",
      statusKey: "IN_PROGRESS",
      creatorId: admin.id,
      reporterId: admin.id,
      bugDetails: {
        stepsToReproduce: "Create an intake record without insurance contact information.",
        expectedBehavior: "The form should show a required-field message before save.",
        actualBehavior: "The record can be saved with incomplete billing context."
      }
    },
    {
      id: "seed-work-item-dispatch-attachments",
      projectId: dispatchProject.id,
      type: "FEATURE" as const,
      title: "Attach site photos to dispatch tickets",
      description: "Field coordinators need photos and PDFs attached to a ticket before approving work.",
      statusKey: "DONE",
      creatorId: admin.id,
      reporterId: admin.id,
      featureDetails: {
        userStory: "As a coordinator, I want relevant files on the ticket so I do not chase context in email.",
        acceptanceCriteria: "Allowed assets can be uploaded, listed, and scoped to the related work item.",
        businessValue: "Keeps approval context in the operations workflow."
      }
    }
  ];

  for (const item of workItems) {
    const status = statusByKey.get(item.statusKey);

    if (!status) {
      throw new Error(`Missing status ${item.statusKey}`);
    }

    const savedItem = await prisma.workItem.upsert({
      where: { id: item.id },
      create: {
        id: item.id,
        projectId: item.projectId,
        type: item.type,
        title: item.title,
        description: item.description,
        creatorId: item.creatorId,
        reporterId: item.reporterId,
        pipelineStatusId: status.id
      },
      update: {
        projectId: item.projectId,
        type: item.type,
        title: item.title,
        description: item.description,
        creatorId: item.creatorId,
        reporterId: item.reporterId,
        pipelineStatusId: status.id,
        archivedAt: null
      }
    });

    if (item.type === "BUG" && item.bugDetails) {
      await prisma.workItemBugDetails.upsert({
        where: { workItemId: savedItem.id },
        create: { workItemId: savedItem.id, ...item.bugDetails },
        update: item.bugDetails
      });
    }

    if (item.type === "FEATURE" && item.featureDetails) {
      await prisma.workItemFeatureDetails.upsert({
        where: { workItemId: savedItem.id },
        create: { workItemId: savedItem.id, ...item.featureDetails },
        update: item.featureDetails
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
