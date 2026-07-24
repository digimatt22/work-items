"use client";

import { useState } from "react";
import type { WorkItemProjectRef } from "@digicolony/shared";
import { buttonClass, compactFieldClass, fieldClass } from "../components/ui";
import { ProjectPicker } from "./ProjectPicker";

type WorkItemType = "BUG" | "FEATURE";

type WorkItemCreateFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultType?: WorkItemType;
  lockedProjectId?: string;
  lockedPipelineStatusId?: string;
  lockedType?: WorkItemType;
  onCancel?: () => void;
  projects: readonly WorkItemProjectRef[];
  testId?: string;
  title?: string;
};

export function WorkItemCreateForm({
  action,
  defaultType = "BUG",
  lockedProjectId,
  lockedPipelineStatusId,
  lockedType,
  onCancel,
  projects,
  testId = "create-work-item-form",
  title = "Create work item",
}: WorkItemCreateFormProps) {
  const [type, setType] = useState<WorkItemType>(lockedType ?? defaultType);
  const activeType = lockedType ?? type;

  return (
    <form
      action={action}
      className="rounded-3xl border border-line bg-surface p-5 shadow-card"
      data-testid={testId}
    >
      <h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-muted">
        {lockedProjectId
          ? "Add the summary and include the details someone needs to triage it."
          : "Choose the client and project, add the summary, and include the details someone needs to triage it."}
      </p>
      {lockedProjectId ? (
        <input name="projectId" type="hidden" value={lockedProjectId} />
      ) : (
        <div className="mt-4">
          <ProjectPicker
            idPrefix={`${testId}-project-picker`}
            projects={projects}
            showClientSelector
          />
        </div>
      )}
      {lockedPipelineStatusId ? (
        <input
          name="pipelineStatusId"
          type="hidden"
          value={lockedPipelineStatusId}
        />
      ) : null}
      {lockedType ? (
        <input name="type" type="hidden" value={lockedType} />
      ) : (
        <div className={lockedProjectId ? "mt-4" : ""}>
          <select
            className={`mt-3 ${compactFieldClass}`}
            name="type"
            onChange={(event) => setType(event.target.value as WorkItemType)}
            required
            value={type}
          >
            <option value="BUG">Bug</option>
            <option value="FEATURE">Feature</option>
          </select>
        </div>
      )}
      <input
        className={`mt-3 ${compactFieldClass}`}
        name="title"
        placeholder="Title"
        required
      />
      <textarea
        className={`mt-3 ${fieldClass}`}
        name="description"
        placeholder="Description"
        required
        rows={3}
      />
      {activeType === "BUG" ? (
        <div className="mt-5 border-t border-line pt-5">
          <p className="text-sm font-bold text-ink">Bug details</p>
          <textarea
            className={`mt-2 ${compactFieldClass}`}
            name="stepsToReproduce"
            placeholder="Steps to reproduce"
            rows={2}
          />
          <textarea
            className={`mt-2 ${compactFieldClass}`}
            name="expectedBehavior"
            placeholder="Expected behavior"
            rows={2}
          />
          <textarea
            className={`mt-2 ${compactFieldClass}`}
            name="actualBehavior"
            placeholder="Actual behavior"
            rows={2}
          />
        </div>
      ) : (
        <div className="mt-5 border-t border-line pt-5">
          <p className="text-sm font-bold text-ink">Feature details</p>
          <textarea
            className={`mt-2 ${compactFieldClass}`}
            name="userStory"
            placeholder="User story"
            rows={2}
          />
          <textarea
            className={`mt-2 ${compactFieldClass}`}
            name="acceptanceCriteria"
            placeholder="Acceptance criteria"
            rows={2}
          />
          <textarea
            className={`mt-2 ${compactFieldClass}`}
            name="businessValue"
            placeholder="Business value"
            rows={2}
          />
        </div>
      )}
      <div className="mt-5 flex gap-2">
        {onCancel ? (
          <button
            className={`flex-1 ${buttonClass("secondary")}`}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        ) : null}
        <button
          className={`${onCancel ? "flex-1" : "w-full"} ${buttonClass("primary")}`}
          type="submit"
        >
          Create
        </button>
      </div>
    </form>
  );
}
