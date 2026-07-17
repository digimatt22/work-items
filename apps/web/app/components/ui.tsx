import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              {eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                {description}
              </p>
            ) : null}
          </div>
          {children ? <div className="w-full xl:w-auto">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  tone = "light",
}: {
  label: string;
  value: number | string;
  detail?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";

  return (
    <div
      className={[
        "min-w-0 rounded-2xl p-4 shadow-card sm:p-5",
        dark ? "bg-ink text-white" : "border border-line bg-surface text-ink",
      ].join(" ")}
    >
      <p className={dark ? "text-xs text-white/60" : "text-xs text-soft"}>
        {label}
      </p>
      <p className="mt-3 truncate text-2xl font-bold tracking-tight sm:text-3xl">
        {value}
      </p>
      {detail ? (
        <p
          className={
            dark ? "mt-2 text-xs text-white/70" : "mt-2 text-xs text-muted"
          }
        >
          {detail}
        </p>
      ) : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-line bg-surface p-5 shadow-card ${className}`}
    >
      {title ? (
        <div className="mb-4">
          <h2 className="text-lg font-bold tracking-tight text-ink">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-muted">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function Badge({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "primary" | "success" | "warning" | "danger";
}) {
  const classes = {
    muted: "bg-blue-soft text-muted",
    primary: "bg-indigo-50 text-indigo-600",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${classes[tone]}`}
    >
      {children}
    </span>
  );
}

export function PencilIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function MenuIcon({
  children,
  className = "size-4",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {children}
    </svg>
  );
}

export function FeatureRequestIcon({
  className = "size-4",
}: {
  className?: string;
}) {
  return (
    <MenuIcon className={className}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M8.7 14.5A7 7 0 1 1 15.3 14.5c-.8.6-1.3 1.4-1.3 2.5h-4c0-1.1-.5-1.9-1.3-2.5Z" />
    </MenuIcon>
  );
}

export function BugIcon({ className = "size-4" }: { className?: string }) {
  return (
    <MenuIcon className={className}>
      <path d="m8 2 2 2" />
      <path d="m14 4 2-2" />
      <path d="M9 7h6" />
      <path d="M8 13h8" />
      <path d="M8 19h8" />
      <rect height="15" rx="4" width="8" x="8" y="5" />
      <path d="M4 13h4" />
      <path d="M16 13h4" />
      <path d="m5 7 3 2" />
      <path d="m16 9 3-2" />
    </MenuIcon>
  );
}

export function ClientIcon({ className = "size-4" }: { className?: string }) {
  return (
    <MenuIcon className={className}>
      <path d="M3 21h18" />
      <path d="M6 21V4h12v17" />
      <path d="M9 8h1" />
      <path d="M14 8h1" />
      <path d="M9 12h1" />
      <path d="M14 12h1" />
      <path d="M9 16h1" />
      <path d="M14 16h1" />
    </MenuIcon>
  );
}

export function ProjectIcon({ className = "size-4" }: { className?: string }) {
  return (
    <MenuIcon className={className}>
      <path d="M3 7h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
      <path d="M3 7V5a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v2" />
      <path d="M8 13v4" />
      <path d="M12 13v2" />
      <path d="M16 13v3" />
    </MenuIcon>
  );
}

export function ClientUserIcon({
  className = "size-4",
}: {
  className?: string;
}) {
  return (
    <MenuIcon className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </MenuIcon>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-blue-soft/50 p-8 text-center">
      <p className="text-base font-bold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          className="mt-5 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white"
          href={actionHref}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function buttonClass(
  variant: "primary" | "secondary" | "ghost" | "danger" = "primary",
) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    secondary:
      "border border-line bg-white text-muted hover:bg-blue-soft hover:text-ink",
    ghost: "text-muted hover:bg-blue-soft hover:text-ink",
    danger: "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  };

  return `${base} ${variants[variant]}`;
}

export const fieldClass =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition placeholder:text-soft focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

export const compactFieldClass =
  "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";
