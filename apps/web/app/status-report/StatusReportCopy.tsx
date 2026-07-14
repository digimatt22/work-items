"use client";

import { useState } from "react";
import { buttonClass } from "../components/ui";

export function StatusReportCopy({ reportText }: { reportText: string }) {
  const [copied, setCopied] = useState(false);

  async function copyReport() {
    await navigator.clipboard.writeText(reportText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm leading-6 text-muted">
          Generated preview only. Copy it into an email draft to edit before sending; sending and recipients are manual for now.
        </p>
        <button className={buttonClass("primary")} onClick={copyReport} type="button">
          {copied ? "Copied" : "Copy report"}
        </button>
      </div>
      <textarea
        className="min-h-[520px] w-full resize-y rounded-2xl border border-line bg-white p-4 font-mono text-sm leading-6 text-ink outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
        readOnly
        value={reportText}
      />
    </div>
  );
}
