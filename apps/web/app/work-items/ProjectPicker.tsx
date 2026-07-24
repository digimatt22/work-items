"use client";

import type { WorkItemProjectRef } from "@digicolony/shared";
import { useMemo, useState } from "react";
import { compactFieldClass } from "../components/ui";

type ProjectPickerProps = {
  idPrefix: string;
  projects: readonly WorkItemProjectRef[];
  showClientSelector: boolean;
};

export type ProjectClientOption = {
  id: string;
  name: string;
};

export function projectClientOptions(
  projects: readonly WorkItemProjectRef[],
): readonly ProjectClientOption[] {
  return Array.from(
    new Map(
      projects.map((project) => [
        project.clientId,
        project.clientName ?? project.clientId,
      ]),
    ).entries(),
  )
    .map(([id, name]) => ({ id, name }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function projectsForClient(
  projects: readonly WorkItemProjectRef[],
  clientId?: string,
): readonly WorkItemProjectRef[] {
  return [...projects]
    .filter((project) => !clientId || project.clientId === clientId)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function ProjectPicker({
  idPrefix,
  projects,
  showClientSelector,
}: ProjectPickerProps) {
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const clients = useMemo(() => projectClientOptions(projects), [projects]);
  const visibleProjects = useMemo(
    () =>
      projectsForClient(
        projects,
        showClientSelector ? clientId || undefined : undefined,
      ),
    [clientId, projects, showClientSelector],
  );
  const projectDisabled = showClientSelector && !clientId;

  return (
    <div className="grid gap-3">
      {showClientSelector ? (
        <div>
          <label
            className="block text-sm font-bold text-ink"
            htmlFor={`${idPrefix}-clientId`}
          >
            Client
          </label>
          <select
            className={`mt-2 ${compactFieldClass}`}
            id={`${idPrefix}-clientId`}
            name="clientId"
            onChange={(event) => {
              setClientId(event.target.value);
              setProjectId("");
            }}
            required
            value={clientId}
          >
            <option value="">Select client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div>
        <label
          className="block text-sm font-bold text-ink"
          htmlFor={`${idPrefix}-projectId`}
        >
          Project
        </label>
        <select
          className={`mt-2 ${compactFieldClass}`}
          disabled={projectDisabled}
          id={`${idPrefix}-projectId`}
          name="projectId"
          onChange={(event) => setProjectId(event.target.value)}
          required
          value={projectId}
        >
          <option value="">
            {projectDisabled ? "Select client first" : "Select project"}
          </option>
          {visibleProjects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
