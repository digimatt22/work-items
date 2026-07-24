"use client";

import type {
  PipelineStatusRecord,
  WorkItemProjectRef,
  WorkspaceClientRecord,
} from "@digicolony/shared";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { CreateClientUserResult } from "../../src/client-users/create-result";
import { WorkItemCreateForm } from "../work-items/WorkItemCreateForm";
import {
  BugIcon,
  ClientIcon,
  ClientUserIcon,
  FeatureRequestIcon,
  ProjectIcon,
  buttonClass,
  compactFieldClass,
  fieldClass,
} from "./ui";

type AppShellProps = {
  children: ReactNode;
  clients?: readonly WorkspaceClientRecord[];
  email?: string | null;
  createClientAction: (formData: FormData) => void | Promise<void>;
  createClientUserAction: (
    formData: FormData,
  ) => Promise<CreateClientUserResult>;
  createProjectAction: (formData: FormData) => void | Promise<void>;
  createWorkItemAction: (formData: FormData) => void | Promise<void>;
  name?: string | null;
  projects?: readonly WorkItemProjectRef[];
  role?: "ADMIN" | "CLIENT_USER";
  signOutAction: (formData: FormData) => void | Promise<void>;
  statuses?: readonly PipelineStatusRecord[];
};

const navItems = [
  { href: "/work-items", label: "Board", mark: "B", view: "board" },
  { href: "/work-items?view=list", label: "List", mark: "L", view: "list" },
  { href: "/status-report", label: "Status", mark: "S", view: "status-report" },
  {
    href: "/integrations/digi-portal",
    label: "Digi-Portal",
    mark: "D",
    view: "digi-portal",
  },
];

const clientNavItems = [
  { href: "/report", label: "Report", mark: "R", view: "report" },
  { href: "/work-items", label: "Board", mark: "B", view: "board" },
];

const addTypeContent = {
  feature: {
    label: "Feature request",
    group: "Requests",
    icon: FeatureRequestIcon,
    description: "Track a client-visible improvement or new capability.",
  },
  bug: {
    label: "Bug report",
    group: "Requests",
    icon: BugIcon,
    description: "Track a defect, blocker, or broken client experience.",
  },
  client: {
    label: "Client",
    group: "Workspace",
    icon: ClientIcon,
    description:
      "Create the account that projects, users, and work items roll up to.",
  },
  project: {
    label: "Project",
    group: "Workspace",
    icon: ProjectIcon,
    description:
      "Create a client project before organizing related work items.",
  },
  user: {
    label: "User",
    group: "Workspace",
    icon: ClientUserIcon,
    description:
      "Invite a client contact who can report and review visible work.",
  },
} as const;

function isActive(pathname: string, view: string, itemView: string): boolean {
  if (itemView === "report") {
    return pathname.startsWith("/report");
  }

  if (itemView === "list") {
    return pathname === "/work-items" && view === "list";
  }

  if (itemView === "status-report") {
    return pathname.startsWith("/status-report");
  }

  if (itemView === "digi-portal") {
    return pathname.startsWith("/integrations/digi-portal");
  }

  return pathname.startsWith("/work-items") && view !== "list";
}

export function AppShell({
  children,
  clients = [],
  createClientAction,
  createClientUserAction,
  createProjectAction,
  createWorkItemAction,
  email,
  name,
  projects = [],
  role = "CLIENT_USER",
  signOutAction,
  statuses = [],
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "board";
  const [addOpen, setAddOpen] = useState(false);
  const [clientUserMessage, setClientUserMessage] = useState<string | null>(
    null,
  );
  const [clientUserCredentials, setClientUserCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);
  const [credentialsCopied, setCredentialsCopied] = useState(false);
  const [addType, setAddType] = useState<
    "feature" | "bug" | "client" | "project" | "user"
  >("feature");
  const defaultStatus =
    statuses.find((status) => status.isDefault) ?? statuses[0];
  const admin = role === "ADMIN";
  const visibleNavItems = admin ? navItems : clientNavItems;
  const handleCreateClient = async (formData: FormData) => {
    await createClientAction(formData);
    setAddOpen(false);
    router.refresh();
  };
  const handleCreateClientUser = async (formData: FormData) => {
    setClientUserMessage(null);
    setClientUserCredentials(null);
    setCredentialsCopied(false);
    const result = await createClientUserAction(formData);

    if (!result.ok) {
      setClientUserMessage(result.message);
      return;
    }

    setClientUserCredentials(result.credentials);
    router.refresh();
  };
  const copyClientUserCredentials = async () => {
    if (!clientUserCredentials) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        `Username: ${clientUserCredentials.username}\nTemporary password: ${clientUserCredentials.password}`,
      );
      setCredentialsCopied(true);
    } catch {
      setClientUserMessage(
        "Copy failed. Select the username and password below to copy them manually.",
      );
    }
  };
  const handleCreateProject = async (formData: FormData) => {
    await createProjectAction(formData);
    setAddOpen(false);
    router.refresh();
  };
  const handleCreateWorkItem = async (formData: FormData) => {
    await createWorkItemAction(formData);
    setAddOpen(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-app text-ink lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 z-30 hidden h-screen overflow-y-auto bg-[#252932] text-white lg:flex lg:flex-col">
        {admin ? (
          <div className="border-b border-white/10 p-4">
            <button
              className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-bold text-white shadow-card transition hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              onClick={() => setAddOpen((open) => !open)}
              type="button"
            >
              <span className="text-xl leading-none">+</span>
              Add
            </button>
          </div>
        ) : null}

        <div className="px-5 py-5">
          <Link
            className="block text-lg font-bold tracking-tight"
            href={admin ? "/work-items" : "/report"}
          >
            DigiColony Ops
          </Link>
          <p className="mt-1 text-xs font-medium text-white/50">
            Client operations memory
          </p>
        </div>

        <nav className="grid gap-1 px-3">
          {visibleNavItems.map((item) => {
            const active = isActive(pathname, view, item.view);

            return (
              <Link
                key={item.href}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className={[
                  "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-semibold transition",
                  active
                    ? "bg-white/12 text-white shadow-card"
                    : "text-white/70 hover:bg-white/8 hover:text-white",
                ].join(" ")}
                href={item.href}
              >
                <span
                  className={[
                    "grid size-5 place-items-center rounded text-[11px]",
                    active
                      ? "bg-emerald-500 text-white"
                      : "bg-white/10 text-white/70",
                  ].join(" ")}
                >
                  {item.mark}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 p-4">
          <p className="truncate text-sm font-semibold">{name ?? email}</p>
          <p className="truncate text-xs text-white/45">{email}</p>
          <Link
            className="mt-4 block w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            href="/settings/password"
          >
            Change password
          </Link>
          <form action={signOutAction} className="mt-2">
            <button className="w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-line bg-surface/95 px-5 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link
            className="text-base font-semibold"
            href={admin ? "/work-items" : "/report"}
          >
            DigiColony Ops
          </Link>
          <div className="flex items-center gap-2">
            <Link
              className={buttonClass("secondary")}
              href="/settings/password"
            >
              Account
            </Link>
            {admin ? (
              <button
                className={buttonClass("primary")}
                onClick={() => {
                  setClientUserCredentials(null);
                  setCredentialsCopied(false);
                  setAddOpen(true);
                }}
                type="button"
              >
                + Add
              </button>
            ) : (
              <Link className={buttonClass("primary")} href="/report">
                Report
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="min-w-0">{children}</div>

      {admin && addOpen ? (
        <div
          className="fixed inset-0 z-50 bg-ink/40 p-4 backdrop-blur-sm"
          role="presentation"
        >
          <div className="mx-auto mt-10 grid max-h-[calc(100vh-5rem)] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-card md:grid-cols-[220px_1fr]">
            <div className="border-b border-line bg-[#f6f7fb] p-3 md:border-b-0 md:border-r">
              {(["feature", "bug", "client", "project", "user"] as const).map(
                (value, index, values) => {
                  const content = addTypeContent[value];
                  const Icon = content.icon;
                  const previousValue = values[index - 1];
                  const previousContent = previousValue
                    ? addTypeContent[previousValue]
                    : null;
                  const showGroup =
                    !previousContent || previousContent.group !== content.group;

                  return (
                    <div key={value}>
                      {showGroup ? (
                        <p
                          className={
                            index === 0
                              ? "px-3 pb-2 text-xs font-bold uppercase tracking-[0.14em] text-soft"
                              : "px-3 pb-2 pt-4 text-xs font-bold uppercase tracking-[0.14em] text-soft"
                          }
                        >
                          {content.group}
                        </p>
                      ) : null}
                      <button
                        aria-pressed={addType === value}
                        className={[
                          "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition",
                          addType === value
                            ? "bg-amber-200 text-ink"
                            : "text-muted hover:bg-white",
                        ].join(" ")}
                        data-testid={`global-add-${value}`}
                        onClick={() => {
                          setAddType(value);
                          setClientUserMessage(null);
                          setClientUserCredentials(null);
                          setCredentialsCopied(false);
                        }}
                        type="button"
                      >
                        <Icon className="size-4 shrink-0 text-emerald-600" />
                        <span className="min-w-0 text-sm font-bold">
                          {content.label}
                        </span>
                      </button>
                    </div>
                  );
                },
              )}
            </div>
            <div className="max-h-[calc(100vh-5rem)] overflow-auto p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                    Add to operations
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-ink">
                    {addTypeContent[addType].label}
                  </h2>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-muted">
                    {addTypeContent[addType].description}
                  </p>
                </div>
                <button
                  className={buttonClass("secondary")}
                  onClick={() => setAddOpen(false)}
                  type="button"
                >
                  Close
                </button>
              </div>

              {addType === "feature" || addType === "bug" ? (
                <WorkItemCreateForm
                  action={handleCreateWorkItem}
                  defaultType={addType === "feature" ? "FEATURE" : "BUG"}
                  lockedPipelineStatusId={defaultStatus?.id}
                  lockedType={addType === "feature" ? "FEATURE" : "BUG"}
                  onCancel={() => setAddOpen(false)}
                  projects={projects}
                  testId="global-create-work-item-form"
                  title={addType === "feature" ? "Add feature" : "Add bug"}
                />
              ) : null}

              {addType === "client" ? (
                <form
                  action={handleCreateClient}
                  className="rounded-2xl border border-line bg-surface p-5"
                  data-testid="global-create-client-form"
                >
                  <input
                    className={compactFieldClass}
                    name="name"
                    placeholder="Client name"
                    required
                  />
                  <textarea
                    className={`mt-3 ${fieldClass}`}
                    name="description"
                    placeholder="Description"
                    rows={4}
                  />
                  <button
                    className={`mt-4 ${buttonClass("primary")}`}
                    type="submit"
                  >
                    Create client
                  </button>
                </form>
              ) : null}

              {addType === "project" ? (
                <form
                  action={handleCreateProject}
                  className="rounded-2xl border border-line bg-surface p-5"
                  data-testid="global-create-project-form"
                >
                  <select
                    className={compactFieldClass}
                    name="clientId"
                    required
                  >
                    <option value="">Select client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className={`mt-3 ${compactFieldClass}`}
                    name="name"
                    placeholder="Project name"
                    required
                  />
                  <textarea
                    className={`mt-3 ${fieldClass}`}
                    name="description"
                    placeholder="Description"
                    rows={4}
                  />
                  <button
                    className={`mt-4 ${buttonClass("primary")}`}
                    type="submit"
                  >
                    Create project
                  </button>
                </form>
              ) : null}

              {addType === "user" && clientUserCredentials ? (
                <section
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
                  data-testid="client-user-credentials"
                >
                  <h3 className="text-lg font-bold text-ink">User created</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">
                    Copy these credentials now. The temporary password is shown
                    only here, and the user must replace it when they first sign
                    in.
                  </p>
                  <label className="mt-4 block text-sm font-bold text-ink">
                    Username
                    <input
                      className={`mt-2 ${compactFieldClass}`}
                      readOnly
                      value={clientUserCredentials.username}
                    />
                  </label>
                  <label className="mt-3 block text-sm font-bold text-ink">
                    Temporary password
                    <input
                      className={`mt-2 font-mono ${compactFieldClass}`}
                      readOnly
                      value={clientUserCredentials.password}
                    />
                  </label>
                  {clientUserMessage ? (
                    <p
                      className="mt-3 text-sm font-semibold text-rose-700"
                      role="alert"
                    >
                      {clientUserMessage}
                    </p>
                  ) : null}
                  <button
                    className={`mt-4 ${buttonClass("primary")}`}
                    onClick={copyClientUserCredentials}
                    type="button"
                  >
                    {credentialsCopied
                      ? "Credentials copied"
                      : "Copy credentials"}
                  </button>
                </section>
              ) : null}

              {addType === "user" && !clientUserCredentials ? (
                <form
                  action={handleCreateClientUser}
                  className="rounded-2xl border border-line bg-surface p-5"
                  data-testid="global-create-client-user-form"
                >
                  <select
                    className={compactFieldClass}
                    name="clientId"
                    required
                  >
                    <option value="">Select client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className={`mt-3 ${compactFieldClass}`}
                    name="email"
                    placeholder="Email"
                    required
                    type="email"
                  />
                  <input
                    className={`mt-3 ${compactFieldClass}`}
                    name="name"
                    placeholder="Name"
                  />
                  <label className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-blue-soft/60 p-3 text-sm text-ink">
                    <input
                      className="mt-0.5 size-4 accent-indigo-600"
                      name="moveWorkItems"
                      type="checkbox"
                    />
                    <span>
                      <span className="block font-bold">Move work items</span>
                      <span className="mt-1 block text-xs leading-5 text-muted">
                        Allow this user to change the status of requests they can see.
                      </span>
                    </span>
                  </label>
                  {clientUserMessage ? (
                    <p
                      className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
                      role="alert"
                    >
                      {clientUserMessage}
                    </p>
                  ) : null}
                  <button
                    className={`mt-4 ${buttonClass("primary")}`}
                    type="submit"
                  >
                    Create user
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
