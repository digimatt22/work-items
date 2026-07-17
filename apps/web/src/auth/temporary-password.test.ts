import { describe, expect, it } from "vitest";
import { generateTemporaryPassword } from "./temporary-password";

describe("generateTemporaryPassword", () => {
  it("creates a strong 20-character password without ambiguous characters", () => {
    const password = generateTemporaryPassword();

    expect(password).toHaveLength(20);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[!@#$%]/);
    expect(password).not.toMatch(/[O0Il1]/);
  });

  it("does not reuse one shared temporary password", () => {
    const passwords = new Set(
      Array.from({ length: 50 }, () => generateTemporaryPassword()),
    );

    expect(passwords.size).toBe(50);
  });
});
