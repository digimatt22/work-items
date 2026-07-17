import { describe, expect, it } from "vitest";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  validateNewPassword,
} from "./password";

describe("validateNewPassword", () => {
  it("requires both password fields", () => {
    expect(validateNewPassword("", "")).toBe("required");
  });

  it("requires matching confirmation", () => {
    expect(
      validateNewPassword("long-enough-password", "different-password"),
    ).toBe("confirmation");
  });

  it("enforces the supported password length", () => {
    const short = "x".repeat(MIN_PASSWORD_LENGTH - 1);
    const long = "x".repeat(MAX_PASSWORD_LENGTH + 1);

    expect(validateNewPassword(short, short)).toBe("length");
    expect(validateNewPassword(long, long)).toBe("length");
  });

  it("accepts matching passwords within the supported length", () => {
    const password = "correct horse battery staple";

    expect(validateNewPassword(password, password)).toBeNull();
  });
});
