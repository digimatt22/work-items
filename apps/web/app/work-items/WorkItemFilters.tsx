"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { buttonClass, compactFieldClass } from "../components/ui";

type ClientProjectFilter = {
  clientId: string;
  clientName: string;
  projects: readonly {
    id: string;
    name: string;
  }[];
};

type WorkItemFiltersProps = {
  clients: readonly ClientProjectFilter[];
  hierarchyLabel?: string;
  query: string;
  searchPlaceholder?: string;
  selectedClientIds: readonly string[];
  selectedProjectIds: readonly string[];
  selectedTypes: readonly string[];
  view: "board" | "list";
};

function toggleValue(values: readonly string[], value: string): string[] {
  return values.includes(value)
    ? values.filter((candidate) => candidate !== value)
    : [...values, value];
}

function replaceValues(params: URLSearchParams, key: string, values: readonly string[]) {
  params.delete(key);
  values.forEach((value) => params.append(key, value));
}

export function WorkItemFilters({
  clients,
  hierarchyLabel = "Any client or project",
  query,
  searchPlaceholder = "Search work, client, project",
  selectedClientIds,
  selectedProjectIds,
  selectedTypes,
  view
}: WorkItemFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const filterRef = useRef<HTMLDivElement>(null);
  const searchReady = useRef(false);
  const [openFilter, setOpenFilter] = useState<"hierarchy" | "type" | null>(null);
  const [queryDraft, setQueryDraft] = useState(query);
  const hierarchyCount = selectedClientIds.length + selectedProjectIds.length;

  function buildParams() {
    const params = new URLSearchParams();

    if (view === "list") {
      params.set("view", "list");
    }

    if (queryDraft.trim()) {
      params.set("q", queryDraft.trim());
    }

    replaceValues(params, "clientIds", selectedClientIds);
    replaceValues(params, "projectIds", selectedProjectIds);
    replaceValues(params, "type", selectedTypes);

    return params;
  }

  function pushParams(params: URLSearchParams) {
    const search = params.toString();
    router.push(search ? `${pathname}?${search}` : pathname);
  }

  function updateHierarchy(kind: "clientIds" | "projectIds", value: string) {
    const params = buildParams();
    const nextValues = toggleValue(
      kind === "clientIds" ? selectedClientIds : selectedProjectIds,
      value
    );

    replaceValues(params, kind, nextValues);
    pushParams(params);
  }

  function updateType(value: string) {
    const params = buildParams();

    replaceValues(params, "type", toggleValue(selectedTypes, value));
    pushParams(params);
  }

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (!filterRef.current?.contains(event.target as Node)) {
        setOpenFilter(null);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!searchReady.current) {
      searchReady.current = true;
      return;
    }

    const timeout = window.setTimeout(() => {
      const params = buildParams();

      if (queryDraft.trim()) {
        params.set("q", queryDraft.trim());
      } else {
        params.delete("q");
      }

      pushParams(params);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [queryDraft]);

  return (
    <div
      className="mt-3 grid gap-2 xl:grid-cols-[minmax(220px,1.4fr)_minmax(300px,1fr)_170px_auto]"
      ref={filterRef}
    >
      <input
        className={compactFieldClass}
        onChange={(event) => setQueryDraft(event.target.value)}
        placeholder={searchPlaceholder}
        type="search"
        value={queryDraft}
      />

      <div className="relative min-w-0">
        <button
          className="flex h-10 w-full items-center justify-between gap-3 rounded-xl border border-line bg-white px-3 text-left text-sm text-ink shadow-sm transition hover:border-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          onClick={() => setOpenFilter(openFilter === "hierarchy" ? null : "hierarchy")}
          type="button"
        >
          <span className="min-w-0 truncate">
            {hierarchyCount > 0 ? `${hierarchyCount} clients/projects selected` : hierarchyLabel}
          </span>
          <span className="text-soft">v</span>
        </button>
        {openFilter === "hierarchy" ? (
          <div className="absolute left-0 top-12 z-30 max-h-[420px] w-[min(560px,calc(100vw-2rem))] overflow-auto rounded-md border border-line bg-white py-2 shadow-card">
            {clients.map((client) => {
              const clientChecked = selectedClientIds.includes(client.clientId);

              return (
                <div key={client.clientId}>
                  <button
                    className="group flex w-full cursor-pointer items-center gap-3 px-3 py-2 text-left text-sm font-bold text-ink hover:bg-amber-100"
                    onClick={() => updateHierarchy("clientIds", client.clientId)}
                    type="button"
                  >
                    <span className="min-w-0 flex-1 truncate">{client.clientName}</span>
                    <input
                      checked={clientChecked}
                      className={[
                        "size-4 shrink-0 rounded border-line transition-opacity",
                        clientChecked ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                      ].join(" ")}
                      onChange={() => updateHierarchy("clientIds", client.clientId)}
                      onClick={(event) => event.stopPropagation()}
                      type="checkbox"
                    />
                  </button>
                  <div>
                    {client.projects.map((project) => {
                      const projectChecked = selectedProjectIds.includes(project.id);

                      return (
                        <button
                          key={project.id}
                          className="group flex w-full cursor-pointer items-center gap-3 px-3 py-2 pl-9 text-left text-sm text-muted hover:bg-amber-100"
                          onClick={() => updateHierarchy("projectIds", project.id)}
                          type="button"
                        >
                          <span className="min-w-0 flex-1 truncate">{project.name}</span>
                          <input
                            checked={projectChecked}
                            className={[
                              "size-4 shrink-0 rounded border-line transition-opacity",
                              projectChecked ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                            ].join(" ")}
                            onChange={() => updateHierarchy("projectIds", project.id)}
                            onClick={(event) => event.stopPropagation()}
                            type="checkbox"
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="relative min-w-0">
        <button
          className="flex h-10 w-full items-center justify-between gap-3 rounded-xl border border-line bg-white px-3 text-left text-sm text-ink shadow-sm transition hover:border-indigo-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          onClick={() => setOpenFilter(openFilter === "type" ? null : "type")}
          type="button"
        >
          <span>{selectedTypes.length > 0 ? `${selectedTypes.length} types selected` : "All types"}</span>
          <span className="text-soft">v</span>
        </button>
        {openFilter === "type" ? (
          <div className="absolute left-0 top-12 z-30 w-full overflow-hidden rounded-md border border-line bg-white py-1 shadow-card">
            {([
              ["BUG", "Bug"],
              ["FEATURE", "Feature"]
            ] as const).map(([value, label]) => {
              const checked = selectedTypes.includes(value);

              return (
                <button
                  key={value}
                  className="group flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-muted hover:bg-amber-100 hover:text-ink"
                  onClick={() => updateType(value)}
                  type="button"
                >
                  <span className="flex-1">{label}</span>
                  <input
                    checked={checked}
                    className={[
                      "size-4 shrink-0 rounded border-line transition-opacity",
                      checked ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                    ].join(" ")}
                    onChange={() => updateType(value)}
                    onClick={(event) => event.stopPropagation()}
                    type="checkbox"
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <button
        className={buttonClass("secondary")}
        onClick={() => router.push(view === "list" ? `${pathname}?view=list` : pathname)}
        type="button"
      >
        Clear
      </button>
    </div>
  );
}
