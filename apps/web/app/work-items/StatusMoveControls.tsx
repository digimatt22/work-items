import type { PipelineStatusRecord } from "@digicolony/shared";

type StatusMoveControlsProps = {
  action: (formData: FormData) => void | Promise<void>;
  currentStatusId: string;
  statuses: readonly PipelineStatusRecord[];
  workItemId: string;
};

function getOrderedStatuses(
  statuses: readonly PipelineStatusRecord[]
): readonly PipelineStatusRecord[] {
  return [...statuses].sort((left, right) => left.sortOrder - right.sortOrder);
}

export function StatusMoveControls({
  action,
  currentStatusId,
  statuses,
  workItemId
}: StatusMoveControlsProps) {
  const orderedStatuses = getOrderedStatuses(statuses);

  return (
    <div className="divide-y divide-line overflow-hidden rounded-md border border-line bg-white">
      {orderedStatuses.map((status) => {
        const current = status.id === currentStatusId;

        if (current) {
          return (
            <div key={status.id} className="flex items-center gap-3 bg-blue-soft px-3 py-2 text-sm font-bold text-ink">
              <span className="size-2 rounded-full bg-indigo-600" />
              <span>{status.label}</span>
            </div>
          );
        }

        return (
          <form key={status.id} action={action}>
            <input name="workItemId" type="hidden" value={workItemId} />
            <button
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-semibold text-muted hover:bg-amber-100 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-indigo-500"
              name="pipelineStatusId"
              type="submit"
              value={status.id}
            >
              <span className="size-2 rounded-full border border-line bg-white" />
              <span>{status.label}</span>
            </button>
          </form>
        );
      })}
    </div>
  );
}
