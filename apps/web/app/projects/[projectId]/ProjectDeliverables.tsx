"use client";

import type { ProjectDeliverableRecord } from "@digicolony/shared";
import { useActionState, useState } from "react";
import { assetConstraints } from "@digicolony/shared";
import { buttonClass, compactFieldClass } from "../../components/ui";
import type {
  DeliverableActionState,
  ShareActionState,
} from "./deliverable-actions";

type Props = {
  readonly projectId: string;
  readonly deliverables: readonly ProjectDeliverableRecord[];
  readonly uploadAction: (
    state: DeliverableActionState,
    formData: FormData,
  ) => Promise<DeliverableActionState>;
  readonly shareAction: (
    state: ShareActionState,
    formData: FormData,
  ) => Promise<ShareActionState>;
  readonly revokeAction: (formData: FormData) => Promise<void>;
};

const idle: DeliverableActionState = { status: "idle", message: "" };
const idleShare: ShareActionState = { status: "idle", message: "" };

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function absoluteShareUrl(path: string): string {
  return typeof window === "undefined"
    ? path
    : `${window.location.origin}${path}`;
}

export function ProjectDeliverables({
  projectId,
  deliverables,
  uploadAction,
  shareAction,
  revokeAction,
}: Props) {
  const [uploadState, uploadFormAction, uploading] = useActionState(
    uploadAction,
    idle,
  );
  const [shareState, shareFormAction, sharing] = useActionState(
    shareAction,
    idleShare,
  );
  const [copied, setCopied] = useState(false);

  const copyNewShare = async () => {
    if (!shareState.share) return;
    const text = `Download link: ${absoluteShareUrl(shareState.share.path)}\nPassword: ${shareState.share.password}\nExpires: ${new Date(shareState.share.expiresAt).toLocaleString()}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
  };

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-lg font-bold tracking-tight text-ink">
          Client deliverables
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Attach finished files to this project, then create a
          password-protected download link. Clients do not need an account.
        </p>
      </div>

      <form
        action={uploadFormAction}
        className="grid gap-3 rounded-2xl border border-line bg-blue-soft p-4 sm:grid-cols-[1fr_auto] sm:items-end"
      >
        <label className="grid gap-2 text-sm font-bold text-ink">
          Add a deliverable
          <input
            accept={assetConstraints.allowedExtensions
              .map((extension) => `.${extension}`)
              .join(",")}
            className={compactFieldClass}
            name="deliverable"
            required
            type="file"
          />
        </label>
        <input name="projectId" type="hidden" value={projectId} />
        <button
          className={buttonClass("primary")}
          disabled={uploading}
          type="submit"
        >
          {uploading ? "Uploading…" : "Upload file"}
        </button>
        {uploadState.message ? (
          <p
            className={`text-sm sm:col-span-2 ${uploadState.status === "error" ? "text-red-700" : "text-emerald-700"}`}
            role="status"
          >
            {uploadState.message}
          </p>
        ) : null}
      </form>

      {shareState.share ? (
        <div
          className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4"
          role="status"
        >
          <p className="font-bold text-emerald-950">
            Link and one-time password
          </p>
          <p className="mt-1 text-sm text-emerald-900">{shareState.message}</p>
          <dl className="mt-4 grid gap-3 text-sm">
            <div>
              <dt className="font-bold text-emerald-950">Download link</dt>
              <dd className="mt-1 break-all font-mono text-xs">
                {absoluteShareUrl(shareState.share.path)}
              </dd>
            </div>
            <div>
              <dt className="font-bold text-emerald-950">Password</dt>
              <dd className="mt-1 font-mono text-base">
                {shareState.share.password}
              </dd>
            </div>
          </dl>
          <button
            className={`mt-4 ${buttonClass("primary")}`}
            onClick={copyNewShare}
            type="button"
          >
            {copied ? "Copied" : "Copy delivery details"}
          </button>
        </div>
      ) : shareState.status === "error" ? (
        <p className="text-sm text-red-700" role="alert">
          {shareState.message}
        </p>
      ) : null}

      <div className="grid gap-4">
        {deliverables.map((deliverable) => (
          <article
            className="rounded-2xl border border-line bg-white p-4"
            key={deliverable.id}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="break-words text-sm font-bold text-ink">
                  {deliverable.filename}
                </h3>
                <p className="mt-1 text-xs text-muted">
                  {formatBytes(deliverable.sizeBytes)} · uploaded{" "}
                  {deliverable.createdAt.toLocaleDateString()}
                </p>
              </div>
              <form
                action={shareFormAction}
                className="flex flex-wrap items-end gap-2"
              >
                <input name="projectId" type="hidden" value={projectId} />
                <input name="assetId" type="hidden" value={deliverable.id} />
                <label className="grid gap-1 text-xs font-bold text-muted">
                  Expires
                  <select
                    className={compactFieldClass}
                    defaultValue="14"
                    name="expiresInDays"
                  >
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                </label>
                <button
                  className={buttonClass("secondary")}
                  disabled={sharing}
                  type="submit"
                >
                  Create link
                </button>
              </form>
            </div>

            {deliverable.shares.length > 0 ? (
              <div className="mt-4 grid gap-2 border-t border-line pt-4">
                {deliverable.shares.map((share) => {
                  const expired = share.expiresAt.getTime() <= Date.now();
                  const active = !share.revokedAt && !expired;
                  return (
                    <div
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-app px-3 py-2 text-xs"
                      key={share.id}
                    >
                      <div>
                        <p className="font-bold text-ink">
                          {active
                            ? "Active link"
                            : share.revokedAt
                              ? "Revoked"
                              : "Expired"}
                        </p>
                        <p className="mt-1 text-muted">
                          Expires {share.expiresAt.toLocaleDateString()} ·{" "}
                          {share.downloadCount} download
                          {share.downloadCount === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {active ? (
                          <button
                            className={buttonClass("secondary")}
                            onClick={() =>
                              navigator.clipboard.writeText(
                                absoluteShareUrl(
                                  `/deliveries/${share.publicToken}`,
                                ),
                              )
                            }
                            type="button"
                          >
                            Copy link
                          </button>
                        ) : null}
                        {active ? (
                          <form action={revokeAction}>
                            <input
                              name="projectId"
                              type="hidden"
                              value={projectId}
                            />
                            <input
                              name="shareId"
                              type="hidden"
                              value={share.id}
                            />
                            <button
                              className={buttonClass("danger")}
                              type="submit"
                            >
                              Revoke
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </article>
        ))}
        {deliverables.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-line p-5 text-sm text-muted">
            No project deliverables yet. Upload the final file you want the
            client to receive.
          </p>
        ) : null}
      </div>
    </div>
  );
}
