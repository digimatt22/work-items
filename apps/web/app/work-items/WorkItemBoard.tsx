"use client";

import type { PipelineStatusRecord, WorkItemRecord } from "@digicolony/shared";
import Link from "next/link";
import { useRef, useState, type DragEvent } from "react";
import { EmptyState } from "../components/ui";

type WorkItemBoardProps = {
  admin: boolean;
  cardTestIdPrefix?: string;
  changeStatusAction: (formData: FormData) => void | Promise<void>;
  emptyDescription: string;
  emptyTitle: string;
  items: readonly WorkItemRecord[];
  showClientName?: boolean;
  statuses: readonly PipelineStatusRecord[];
};

function columnItems(
  items: readonly WorkItemRecord[],
  statusId: string
): readonly WorkItemRecord[] {
  return items.filter((item) => item.pipelineStatusId === statusId);
}

export function WorkItemBoard({
  admin,
  cardTestIdPrefix = "work-item-card",
  changeStatusAction,
  emptyDescription,
  emptyTitle,
  items,
  showClientName = true,
  statuses
}: WorkItemBoardProps) {
  const [draggedWorkItemId, setDraggedWorkItemId] = useState<string | null>(null);
  const [dropTargetStatusId, setDropTargetStatusId] = useState<string | null>(null);
  const workItemInput = useRef<HTMLInputElement>(null);
  const statusInput = useRef<HTMLInputElement>(null);
  const moveForm = useRef<HTMLFormElement>(null);

  function handleDrop(event: DragEvent<HTMLDivElement>, statusId: string) {
    event.preventDefault();
    const workItemId = event.dataTransfer.getData("text/plain") || draggedWorkItemId;

    setDraggedWorkItemId(null);
    setDropTargetStatusId(null);

    if (!admin || !workItemId) {
      return;
    }

    const item = items.find((candidate) => candidate.id === workItemId);

    if (!item || item.pipelineStatusId === statusId) {
      return;
    }

    if (workItemInput.current && statusInput.current && moveForm.current) {
      workItemInput.current.value = workItemId;
      statusInput.current.value = statusId;
      moveForm.current.requestSubmit();
    }
  }

  return (
    <div className="min-h-0">
      <form action={changeStatusAction} aria-hidden="true" className="hidden" ref={moveForm}>
        <input name="workItemId" ref={workItemInput} type="hidden" />
        <input name="pipelineStatusId" ref={statusInput} type="hidden" />
      </form>

      <nav className="flex gap-2 overflow-x-auto border-x border-t border-line bg-white px-3 py-2 lg:hidden" aria-label="Board status sections">
        {statuses.map((status) => {
          const currentItems = columnItems(items, status.id);

          return (
            <a
              key={status.id}
              className="shrink-0 rounded-full border border-line bg-blue-soft px-3 py-1.5 text-xs font-bold text-muted"
              href={`#status-${status.key.toLowerCase()}`}
            >
              {status.label} ({currentItems.length})
            </a>
          );
        })}
      </nav>

      <div className="h-[calc(100vh-10.5rem)] min-h-[560px] overflow-y-auto border border-line bg-[#f3f5f9]">
      <div className="grid min-w-0 lg:grid-cols-2 xl:grid-cols-4">
        {statuses.map((status) => {
          const currentItems = columnItems(items, status.id);
          const isDropTarget = dropTargetStatusId === status.id;

          return (
            <div
              key={status.id}
              className={[
                "group relative min-h-[calc(100vh-10.6rem)] min-w-0 border-r border-line bg-[#eef2f8] p-3 transition last:border-r-0",
                isDropTarget ? "bg-indigo-50 ring-2 ring-inset ring-indigo-400" : ""
              ].join(" ")}
              data-testid={`work-item-column-${status.key.toLowerCase()}`}
              id={`status-${status.key.toLowerCase()}`}
              onDragLeave={() => setDropTargetStatusId(null)}
              onDragOver={(event) => {
                if (!admin) {
                  return;
                }

                event.preventDefault();
                setDropTargetStatusId(status.id);
              }}
              onDrop={(event) => handleDrop(event, status.id)}
            >
              <div className="sticky top-0 z-10 -mx-3 -mt-3 flex min-h-11 items-center justify-between gap-3 border-b border-line bg-[#eef2f8]/95 px-3 backdrop-blur">
                <h3 className="truncate text-sm font-bold text-ink">{status.label}</h3>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-bold text-muted">
                  {currentItems.length}
                </span>
              </div>

              <div className="mt-4 grid gap-3">
                {currentItems.map((item) => (
                  <article
                    key={item.id}
                    className={[
                      "min-w-0 rounded-lg border border-line bg-white p-3 shadow-sm transition",
                      item.type === "BUG" ? "border-l-4 border-l-rose-500" : "border-l-4 border-l-indigo-500",
                      admin ? "cursor-grab active:cursor-grabbing" : ""
                    ].join(" ")}
                    data-testid={`${cardTestIdPrefix}-${item.id}`}
                    draggable={admin}
                    onDragEnd={() => {
                      setDraggedWorkItemId(null);
                      setDropTargetStatusId(null);
                    }}
                    onDragStart={(event) => {
                      setDraggedWorkItemId(item.id);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", item.id);
                    }}
                  >
                    <p className="mb-2 truncate text-[11px] font-bold uppercase tracking-[0.08em] text-soft">
                      {item.projectName ?? item.projectId}
                    </p>
                    <div className="flex items-start justify-between gap-3">
                      <Link className="line-clamp-3 min-w-0 break-words text-sm font-bold leading-5 text-ink [overflow-wrap:anywhere] hover:text-indigo-600" href={`/work-items/${item.id}`}>
                        {item.title}
                      </Link>
                    </div>
                    {showClientName ? (
                      <p className="mt-3 truncate text-xs font-semibold text-muted">
                        {item.clientName ?? item.clientId}
                      </p>
                    ) : null}
                  </article>
                ))}
                {currentItems.length === 0 ? (
                  <div className="border border-dashed border-line bg-white/70 p-4 text-xs leading-5 text-soft">
                    {admin ? "Drop work here." : "No requests here."}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-5">
          <EmptyState description={emptyDescription} title={emptyTitle} />
        </div>
      ) : null}
    </div>
  );
}
