import {
  createPrismaAgentDeliveryFoundationRepository,
  prisma,
} from "@digicolony/db";
import { buildDigiPortalProjectConfig } from "@digicolony/shared";
import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { principalFromSession } from "../../../src/auth/principal";
import {
  digiPortalFeatureFlags,
  digiPortalPlatformUrl,
} from "../../../src/digi-portal/feature-flags";
import {
  Badge,
  EmptyState,
  PageHeader,
  Panel,
  buttonClass,
  compactFieldClass,
  fieldClass,
} from "../../components/ui";
import {
  activateDigiPortalBindingAction,
  createPendingDigiPortalBindingAction,
} from "./actions";

export default async function DigiPortalIntegrationPage() {
  const session = await auth();
  const principal = principalFromSession(session);

  if (!principal) {
    redirect("/sign-in");
  }

  if (principal.kind !== "user" || principal.user.role !== "ADMIN") {
    redirect("/work-items");
  }

  const flags = digiPortalFeatureFlags();
  const platformUrl = digiPortalPlatformUrl();
  const repository = createPrismaAgentDeliveryFoundationRepository(prisma);
  const [projects, bindings] = await Promise.all([
    repository.listProjects(),
    repository.listBindings(),
  ]);
  const activeProjects = projects.filter((project) => !project.archivedAt);
  const setupEnabled = flags.adminBindings && Boolean(platformUrl);

  return (
    <main className="min-h-screen bg-app">
      <PageHeader
        description="Prepare non-secret project bindings for the future Digi-Portal plugin. Agent reads and writes remain independently disabled."
        eyebrow="Integration foundation"
        title="Digi-Portal"
      >
        <div className="flex flex-wrap gap-2">
          <Badge>
            {flags.adminBindings
              ? "Binding setup enabled"
              : "Binding setup disabled"}
          </Badge>
          <Badge>
            {flags.agentReads ? "Agent reads enabled" : "Agent reads disabled"}
          </Badge>
          <Badge>
            {flags.agentMutations
              ? "Agent writes enabled"
              : "Agent writes disabled"}
          </Badge>
        </div>
      </PageHeader>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-10">
        <div className="min-w-0 grid gap-6">
          <Panel className="min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">Project bindings</h2>
                <p className="mt-1 text-sm leading-6 text-muted">
                  Pending bindings remain inert until an administrator verifies
                  the repository config and activates them.
                </p>
              </div>
              <Badge>{bindings.length}</Badge>
            </div>

            <div className="mt-5 grid gap-4">
              {bindings.map((binding) => {
                const config = buildDigiPortalProjectConfig({
                  platformUrl: binding.platformUrl,
                  projectId: binding.projectId,
                  bindingId: binding.id,
                  environment: binding.environment,
                  repositoryRef: binding.repositoryRef,
                });

                return (
                  <article
                    className="rounded-2xl border border-line p-4"
                    key={binding.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-ink">
                          {binding.projectName}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {binding.clientName} / {binding.environment} /{" "}
                          {binding.repositoryRef}
                        </p>
                      </div>
                      <Badge>{binding.status}</Badge>
                    </div>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-soft">
                      `.work-items/project.json`
                    </p>
                    <pre className="mt-2 overflow-auto rounded-xl bg-ink p-4 text-xs leading-5 text-white/80">
                      {JSON.stringify(config, null, 2)}
                    </pre>
                    <p className="mt-2 break-all text-xs text-soft">
                      Fingerprint: {binding.configFingerprint}
                    </p>
                    {binding.status === "PENDING" ? (
                      <form
                        action={activateDigiPortalBindingAction}
                        className="mt-3"
                      >
                        <input
                          type="hidden"
                          name="bindingId"
                          value={binding.id}
                        />
                        <input
                          type="hidden"
                          name="configFingerprint"
                          value={binding.configFingerprint}
                        />
                        <button
                          className={buttonClass()}
                          disabled={!flags.adminBindings}
                          type="submit"
                        >
                          Verify config and activate
                        </button>
                      </form>
                    ) : null}
                  </article>
                );
              })}

              {bindings.length === 0 ? (
                <EmptyState
                  description="Enable admin binding setup and configure the platform URL to create the first inert binding."
                  title="No Digi-Portal bindings"
                />
              ) : null}
            </div>
          </Panel>
        </div>

        <div className="min-w-0 grid content-start gap-6">
          <Panel className="min-w-0">
            <h2 className="text-lg font-bold text-ink">
              Create pending binding
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              This creates identifiers and an audit record only. It does not
              issue a credential or enable an agent.
            </p>

            {!flags.adminBindings ? (
              <p className="mt-4 break-words rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                Set DIGI_PORTAL_ADMIN_BINDINGS_ENABLED=true to enable this form.
              </p>
            ) : null}
            {!platformUrl ? (
              <p className="mt-3 break-words rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
                Set DIGI_PORTAL_PLATFORM_URL to the externally reachable portal
                origin.
              </p>
            ) : null}

            <form
              action={createPendingDigiPortalBindingAction}
              className="mt-5 grid gap-3"
            >
              <label className="grid gap-1 text-sm font-bold text-ink">
                Project
                <select
                  className={compactFieldClass}
                  disabled={!setupEnabled}
                  name="projectId"
                  required
                >
                  <option value="">Select project</option>
                  {activeProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.clientName} / {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-bold text-ink">
                Environment
                <select
                  className={compactFieldClass}
                  disabled={!setupEnabled}
                  name="environment"
                  required
                >
                  <option value="DEVELOPMENT">Development</option>
                  <option value="PILOT">Pilot</option>
                  <option value="PRODUCTION">Production</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm font-bold text-ink">
                Repository reference
                <input
                  className={fieldClass}
                  disabled={!setupEnabled}
                  name="repositoryRef"
                  placeholder="owner/repository or stable local identity"
                  required
                />
              </label>
              <label className="grid gap-1 text-sm font-bold text-ink">
                Workspace reference (optional)
                <input
                  className={fieldClass}
                  disabled={!setupEnabled}
                  name="workspaceRef"
                  placeholder="Human-readable ChatGPT Work project reference"
                />
              </label>
              <button
                className={`${buttonClass("primary")} disabled:cursor-not-allowed disabled:opacity-45`}
                disabled={!setupEnabled}
                type="submit"
              >
                Create pending binding
              </button>
            </form>
          </Panel>

          <Panel className="min-w-0">
            <h2 className="text-sm font-bold text-ink">
              Phase 0 safety posture
            </h2>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
              <li>• Config payload contains no credential.</li>
              <li>
                • Exactly one active binding will be enforced by the active-key
                constraint.
              </li>
              <li>• Only admins can mark work agent-ready.</li>
              <li>• Agent reads and mutations default to off.</li>
            </ul>
          </Panel>
        </div>
      </section>
    </main>
  );
}
