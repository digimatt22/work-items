import { describe, expect, it, vi } from "vitest";
import { dependencyReadiness } from "./dependency-readiness";

describe("dependency readiness", () => {
  it("reports ready only when PostgreSQL and storage are both usable", async () => {
    await expect(
      dependencyReadiness({
        database: vi.fn().mockResolvedValue(undefined),
        storage: vi.fn().mockResolvedValue(undefined),
      }),
    ).resolves.toEqual({
      status: "ok",
      checks: {
        database: "ok",
        storage: "ok",
      },
    });
  });

  it("sanitizes PostgreSQL failures", async () => {
    const secretBearingError = new Error(
      "postgresql://appuser:do-not-expose@database/appdb",
    );

    const result = await dependencyReadiness({
      database: vi.fn().mockRejectedValue(secretBearingError),
      storage: vi.fn().mockResolvedValue(undefined),
    });

    expect(result).toEqual({
      status: "unavailable",
      checks: {
        database: "unavailable",
        storage: "ok",
      },
    });
    expect(JSON.stringify(result)).not.toContain("appuser");
    expect(JSON.stringify(result)).not.toContain("do-not-expose");
  });

  it("sanitizes Garage failures", async () => {
    const secretBearingError = new Error(
      "Garage key do-not-expose cannot read digicolony-client-ops",
    );

    const result = await dependencyReadiness({
      database: vi.fn().mockResolvedValue(undefined),
      storage: vi.fn().mockRejectedValue(secretBearingError),
    });

    expect(result).toEqual({
      status: "unavailable",
      checks: {
        database: "ok",
        storage: "unavailable",
      },
    });
    expect(JSON.stringify(result)).not.toContain("digicolony-client-ops");
    expect(JSON.stringify(result)).not.toContain("do-not-expose");
  });

  it("reports only a sanitized failure category and status", async () => {
    const reportFailure = vi.fn();
    const accessDenied = Object.assign(
      new Error("Garage key do-not-expose failed"),
      { $metadata: { httpStatusCode: 403 } },
    );

    await dependencyReadiness(
      {
        database: vi.fn().mockResolvedValue(undefined),
        storage: vi.fn().mockRejectedValue(accessDenied),
      },
      2_000,
      reportFailure,
    );

    expect(reportFailure).toHaveBeenCalledWith({
      dependency: "storage",
      kind: "error",
      status: 403,
    });
    expect(JSON.stringify(reportFailure.mock.calls)).not.toContain(
      "do-not-expose",
    );
  });

  it("fails a stalled dependency within the configured deadline", async () => {
    const never = () => new Promise<void>(() => undefined);
    const reportFailure = vi.fn();

    await expect(
      dependencyReadiness(
        {
          database: never,
          storage: vi.fn().mockResolvedValue(undefined),
        },
        5,
        reportFailure,
      ),
    ).resolves.toEqual({
      status: "unavailable",
      checks: {
        database: "unavailable",
        storage: "ok",
      },
    });
    expect(reportFailure).toHaveBeenCalledWith({
      dependency: "database",
      kind: "timeout",
    });
  });
});
