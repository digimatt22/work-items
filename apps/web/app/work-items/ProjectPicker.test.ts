import { describe, expect, it } from "vitest";
import type { WorkItemProjectRef } from "@digicolony/shared";
import { projectClientOptions, projectsForClient } from "./ProjectPicker";

const projects: readonly WorkItemProjectRef[] = [
  {
    id: "project-zeta",
    clientId: "client-b",
    clientName: "Beta Client",
    name: "Zeta Project",
  },
  {
    id: "project-alpha",
    clientId: "client-a",
    clientName: "Alpha Client",
    name: "Alpha Project",
  },
  {
    id: "project-beta",
    clientId: "client-a",
    clientName: "Alpha Client",
    name: "Beta Project",
  },
];

describe("project picker options", () => {
  it("deduplicates and sorts clients", () => {
    expect(projectClientOptions(projects)).toEqual([
      { id: "client-a", name: "Alpha Client" },
      { id: "client-b", name: "Beta Client" },
    ]);
  });

  it("filters and sorts projects within the selected client", () => {
    expect(
      projectsForClient(projects, "client-a").map((project) => project.id),
    ).toEqual(["project-alpha", "project-beta"]);
    expect(
      projectsForClient(projects, "client-b").map((project) => project.id),
    ).toEqual(["project-zeta"]);
  });
});
