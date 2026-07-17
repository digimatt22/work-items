import { describe, expect, it } from "vitest";
import { isCredentialsSignInError } from "./errors";

describe("isCredentialsSignInError", () => {
  it("recognizes the production Auth.js error shape without relying on class identity", () => {
    const error = Object.assign(new Error("invalid credentials"), {
      type: "CredentialsSignin",
    });

    expect(isCredentialsSignInError(error)).toBe(true);
  });

  it("does not hide unrelated server errors", () => {
    expect(isCredentialsSignInError(new Error("database unavailable"))).toBe(
      false,
    );
    expect(isCredentialsSignInError({ type: "CallbackRouteError" })).toBe(
      false,
    );
  });
});
