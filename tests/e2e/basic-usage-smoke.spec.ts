import { expect, test } from "@playwright/test";

test.describe("basic usage smoke", () => {
  test("serves the homepage", async ({ request }) => {
    const response = await request.get("/");

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Sign in");
  });

  test("redirects unauthenticated clients area to sign in", async ({ request }) => {
    const response = await request.get("/clients");

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Sign in");
  });

  test("redirects unauthenticated board to sign in", async ({ request }) => {
    const response = await request.get("/work-items");

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Sign in");
  });

  test("redirects unauthenticated report form to sign in", async ({ request }) => {
    const response = await request.get("/report");

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Sign in");
  });

  test("exposes Auth.js providers", async ({ request }) => {
    const response = await request.get("/api/auth/providers");

    expect(response.status()).toBe(200);
    expect(await response.json()).toHaveProperty("credentials");
  });

  test("redirects the retired MVP review checkpoint", async ({ request }) => {
    const response = await request.get("/mvp-review");

    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("Sign in");
  });
});
