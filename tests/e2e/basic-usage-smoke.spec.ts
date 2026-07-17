import { expect, test } from "@playwright/test";

test.describe("basic usage smoke", () => {
  test("serves the deployment health endpoint", async ({ request }) => {
    const response = await request.get("/api/health");

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });

  test("serves the homepage", async ({ request }) => {
    const response = await request.get("/");

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Sign in");
  });

  test("shows a safe error for invalid credentials", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("not-a-user@example.test");
    await page
      .getByLabel("Password", { exact: true })
      .fill("definitely-not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/sign-in\?error=credentials$/);
    await expect(
      page.getByText("Email or password is incorrect.", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Application error")).toHaveCount(0);
  });

  test("does not reveal whether a known email has the wrong password", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("mwood@digicolony.com");
    await page
      .getByLabel("Password", { exact: true })
      .fill("intentionally-wrong-password");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page).toHaveURL(/\/sign-in\?error=credentials$/);
    await expect(
      page.getByText("Email or password is incorrect.", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Application error")).toHaveCount(0);
  });

  test("redirects unauthenticated clients area to sign in", async ({
    request,
  }) => {
    const response = await request.get("/clients");

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Sign in");
  });

  test("redirects unauthenticated board to sign in", async ({ request }) => {
    const response = await request.get("/work-items");

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Sign in");
  });

  test("redirects unauthenticated report form to sign in", async ({
    request,
  }) => {
    const response = await request.get("/report");

    expect(response.status()).toBe(200);
    expect(await response.text()).toContain("Sign in");
  });

  test("protects password settings from unauthenticated access", async ({
    request,
  }) => {
    const response = await request.get("/settings/password");

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
