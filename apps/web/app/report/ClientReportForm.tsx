"use client";

import { useState } from "react";
import type { WorkItemProjectRef } from "@digicolony/shared";
import { buttonClass, compactFieldClass, fieldClass } from "../components/ui";

type ReportType = "BUG" | "FEATURE";

type ClientReportFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultPipelineStatusId?: string;
  projects: readonly WorkItemProjectRef[];
};

const reportTypes: Array<{ value: ReportType; label: string; description: string }> = [
  {
    value: "BUG",
    label: "Report Bug",
    description: "Something is broken, incorrect, confusing, or not working as expected."
  },
  {
    value: "FEATURE",
    label: "Request a feature",
    description: "A new capability, improvement, workflow, or change would help your team."
  }
];

export function ClientReportForm({
  action,
  defaultPipelineStatusId,
  projects
}: ClientReportFormProps) {
  const [type, setType] = useState<ReportType>("BUG");

  return (
    <form
      action={action}
      className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-6 sm:px-6 lg:px-8"
      data-testid="client-report-form"
    >
      <input name="type" type="hidden" value={type} />
      {defaultPipelineStatusId ? (
        <input name="pipelineStatusId" type="hidden" value={defaultPipelineStatusId} />
      ) : null}

      <section className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
          Client reporting
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Tell us what needs attention
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Choose the project, pick the kind of request, and add the details you have. Screenshots, logs, documents, and short videos are welcome.
        </p>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <label className="block text-sm font-bold text-ink" htmlFor="projectId">
          Project
        </label>
        <select
          className={`mt-2 ${compactFieldClass}`}
          id="projectId"
          name="projectId"
          required
        >
          <option value="">Select project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </section>

      <section className="grid gap-3 sm:grid-cols-2" role="tablist" aria-label="Report type">
        {reportTypes.map((item) => {
          const active = type === item.value;

          return (
            <button
              key={item.value}
              aria-selected={active}
              className={[
                "min-h-28 rounded-2xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
                active
                  ? "border-indigo-500 bg-indigo-50 text-ink shadow-card"
                  : "border-line bg-surface text-muted hover:border-indigo-200 hover:bg-blue-soft"
              ].join(" ")}
              onClick={() => setType(item.value)}
              role="tab"
              type="button"
            >
              <span className="text-base font-bold text-ink">{item.label}</span>
              <span className="mt-2 block text-sm leading-6">{item.description}</span>
            </button>
          );
        })}
      </section>

      <section className="rounded-2xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <div className="grid gap-4">
          <label className="block text-sm font-bold text-ink" htmlFor="title">
            Short summary
          </label>
          <input
            className={compactFieldClass}
            id="title"
            name="title"
            placeholder={type === "BUG" ? "Example: Checkout page shows an error after clicking Submit" : "Example: Add a weekly project health email"}
            required
          />

          <label className="block text-sm font-bold text-ink" htmlFor="description">
            What should we know?
          </label>
          <textarea
            className={fieldClass}
            id="description"
            name="description"
            placeholder={type === "BUG" ? "Example: This started today around 2 PM. It happens for two people on Chrome after entering payment details." : "Example: Our managers need a weekly summary with open items, blockers, and decisions needed before Monday planning."}
            required
            rows={5}
          />
        </div>

        {type === "BUG" ? (
          <div className="mt-6 grid gap-4 border-t border-line pt-5">
            <label className="block text-sm font-bold text-ink" htmlFor="stepsToReproduce">
              Steps to reproduce
            </label>
            <textarea className={fieldClass} id="stepsToReproduce" name="stepsToReproduce" placeholder="Example: 1. Open the client portal. 2. Go to Billing. 3. Click Submit." rows={3} />

            <label className="block text-sm font-bold text-ink" htmlFor="expectedBehavior">
              What did you expect?
            </label>
            <textarea className={fieldClass} id="expectedBehavior" name="expectedBehavior" placeholder="Example: The invoice should save and show a confirmation message." rows={3} />

            <label className="block text-sm font-bold text-ink" htmlFor="actualBehavior">
              What happened instead?
            </label>
            <textarea className={fieldClass} id="actualBehavior" name="actualBehavior" placeholder="Example: A red error appears and the invoice does not save." rows={3} />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 border-t border-line pt-5">
            <label className="block text-sm font-bold text-ink" htmlFor="userStory">
              Who needs this and why?
            </label>
            <textarea className={fieldClass} id="userStory" name="userStory" placeholder="Example: As an operations manager, I want a weekly email summary so I can prepare for Monday planning." rows={3} />

            <label className="block text-sm font-bold text-ink" htmlFor="acceptanceCriteria">
              What would make this complete?
            </label>
            <textarea className={fieldClass} id="acceptanceCriteria" name="acceptanceCriteria" placeholder="Example: The email includes open bugs, active feature requests, blockers, and links to each item." rows={3} />

            <label className="block text-sm font-bold text-ink" htmlFor="businessValue">
              Business value
            </label>
            <textarea className={fieldClass} id="businessValue" name="businessValue" placeholder="Example: Saves each manager 30 minutes per week and keeps launch blockers visible." rows={3} />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-dashed border-line bg-[#fbfcff] p-4 sm:p-5">
        <label className="block text-sm font-bold text-ink" htmlFor="attachments">
          Attach screenshots or files
        </label>
        <input
          className="mt-3 block w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-muted file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-bold file:text-indigo-700"
          id="attachments"
          multiple
          name="attachments"
          type="file"
        />
        <p className="mt-2 text-xs leading-5 text-soft">
          Accepted examples: screenshots, PDFs, spreadsheets, logs, short videos, and zip files.
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a className={buttonClass("secondary")} href="/work-items">
          View my requests
        </a>
        <button className={buttonClass("primary")} type="submit">
          Submit report
        </button>
      </div>
    </form>
  );
}
