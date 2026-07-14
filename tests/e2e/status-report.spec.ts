import { expect, test } from "@playwright/test";

test.describe("weekly status report", () => {
  test("lets admins generate copy-ready weekly status text", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("admin@digicolony.local");
    await page.getByLabel("Password").fill("ChangeMe123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.getByRole("button", { name: "Sign out" }).waitFor();

    await page.getByRole("link", { exact: true, name: "Status" }).click();
    await expect(page.getByRole("heading", { name: "Status report" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open board" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Open list" })).toHaveCount(0);

    const reportText = page.getByRole("textbox");
    await expect(reportText).toContainText("Subject: Weekly status update");
    await expect(reportText).toContainText("Planned next:");
    await expect(reportText).toContainText("In progress:");
    await expect(reportText).toContainText("Recently completed:");
    await expect(reportText).toContainText("Login page error blocks client review");
    await expect(reportText).toContainText("Weekly request summary for launch reviewers");
    await expect(reportText).toContainText("Attach site photos to dispatch tickets");
  });

  test("generates report copy from current board filters", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("admin@digicolony.local");
    await page.getByLabel("Password").fill("ChangeMe123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.getByRole("button", { name: "Sign out" }).waitFor();

    await page.goto("/work-items?projectIds=seed-project-client-portal&type=BUG");
    const reportLink = page.getByRole("link", { name: "Generate report" });
    await expect(reportLink).toHaveAttribute("href", /projectIds=seed-project-client-portal/);
    await expect(reportLink).toHaveAttribute("href", /type=BUG/);

    await reportLink.click();
    await expect(page).toHaveURL(/\/status-report\?/);
    await expect(page.getByText("Using 2 active board filters for this email preview.", { exact: true })).toBeVisible();

    const reportText = page.getByRole("textbox");
    await expect(reportText).toContainText("Login page error blocks client review");
    await expect(reportText).not.toContainText("Weekly request summary for launch reviewers");
    await expect(reportText).not.toContainText("Attach site photos to dispatch tickets");
    await expect(page.getByRole("link", { name: "Open board" })).toHaveAttribute("href", /projectIds=seed-project-client-portal/);
  });

  test("keeps client users out of the admin status report", async ({ page }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("client@digicolony.local");
    await page.getByLabel("Password").fill("ChangeMe123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL("**/report");

    await page.goto("/status-report");
    await page.waitForURL("**/work-items");
    await expect(page.getByRole("heading", { exact: true, name: "Board" })).toBeVisible();
  });
});
