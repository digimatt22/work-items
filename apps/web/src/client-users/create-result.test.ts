import { describe, expect, it } from "vitest";
import { clientUserCreationErrorMessage } from "./create-result";

describe("clientUserCreationErrorMessage", () => {
  it("turns duplicate emails into a safe, actionable message", () => {
    expect(clientUserCreationErrorMessage({ code: "P2002" })).toBe(
      "A user with this email already exists.",
    );
  });

  it("handles stale client selections", () => {
    expect(clientUserCreationErrorMessage({ code: "P2025" })).toBe(
      "The selected client is no longer available. Refresh and try again.",
    );
  });

  it("does not expose unexpected error details", () => {
    expect(
      clientUserCreationErrorMessage(new Error("database.example.internal")),
    ).toBe("We could not create this client user. Please try again.");
  });
});
