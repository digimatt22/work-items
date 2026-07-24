export type DependencyStatus = "ok" | "unavailable";

export interface DependencyReadiness {
  readonly status: "ok" | "unavailable";
  readonly checks: {
    readonly database: DependencyStatus;
    readonly storage: DependencyStatus;
  };
}

export interface DependencyChecks {
  readonly database: () => Promise<void>;
  readonly storage: () => Promise<void>;
}

export interface DependencyFailure {
  readonly dependency: keyof DependencyChecks;
  readonly kind: "error" | "timeout";
  readonly status?: number;
}

export type DependencyFailureReporter = (failure: DependencyFailure) => void;

const DEFAULT_TIMEOUT_MS = 2_000;

async function boundedCheck(
  dependency: keyof DependencyChecks,
  check: () => Promise<void>,
  timeoutMs: number,
  reportFailure?: DependencyFailureReporter,
): Promise<DependencyStatus> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let timedOut = false;

  try {
    await Promise.race([
      check(),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => {
          timedOut = true;
          reject(new Error("Dependency readiness timed out."));
        }, timeoutMs);
      }),
    ]);
    return "ok";
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "$metadata" in error &&
      typeof error.$metadata === "object" &&
      error.$metadata !== null &&
      "httpStatusCode" in error.$metadata &&
      typeof error.$metadata.httpStatusCode === "number"
        ? error.$metadata.httpStatusCode
        : undefined;

    reportFailure?.({
      dependency,
      kind: timedOut ? "timeout" : "error",
      ...(status ? { status } : {}),
    });
    return "unavailable";
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export async function dependencyReadiness(
  checks: DependencyChecks,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  reportFailure?: DependencyFailureReporter,
): Promise<DependencyReadiness> {
  const [database, storage] = await Promise.all([
    boundedCheck("database", checks.database, timeoutMs, reportFailure),
    boundedCheck("storage", checks.storage, timeoutMs, reportFailure),
  ]);
  const status = database === "ok" && storage === "ok" ? "ok" : "unavailable";

  return {
    status,
    checks: {
      database,
      storage,
    },
  };
}
