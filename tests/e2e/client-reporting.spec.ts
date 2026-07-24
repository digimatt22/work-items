import { expect, test } from "@playwright/test";

test.describe("client reporting", () => {
  test("supports client comments and asset attachment on visible requests", async ({
    page,
  }) => {
    const suffix = Date.now();
    const comment = `Client launch review note ${suffix} @matt`;

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("client@digicolony.local");
    await page.getByLabel("Password").fill("ChangeMe123!");
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL("**/report");
    await page.goto("/work-items/seed-client-report-feature");

    await expect(
      page.getByRole("heading", {
        name: "Weekly request summary for launch reviewers",
      }),
    ).toBeVisible();
    await expect(page.getByText("Request details")).toBeVisible();
    await expect(page.getByText("Who needs this and why")).toBeVisible();
    await expect(page.getByText("What would make this complete")).toBeVisible();
    await expect(page.getByText("Why it matters")).toBeVisible();
    await expect(
      page.getByText("DigiColony is actively working on this request."),
    ).toBeVisible();
    await expect(page.getByText("Work record")).toHaveCount(0);
    await expect(page.getByText("User story")).toHaveCount(0);
    await expect(page.getByText("Acceptance criteria")).toHaveCount(0);
    await expect(page.getByText("Business value")).toHaveCount(0);
    await expect(page.getByText("No assets attached.")).toBeVisible();
    await expect(page.getByText(/Allowed: .*\.txt.*Max 100 MB/)).toBeVisible();

    await page.getByRole("button", { name: "+ Add comment" }).click();
    await page
      .getByPlaceholder("Add a comment. Mentions like @matt are captured.")
      .fill(comment);
    await page
      .getByRole("button", { exact: true, name: "Add comment" })
      .click();
    await expect(page.getByText(comment)).toBeVisible();

    await page
      .locator("input[name=asset]")
      .setInputFiles("tests/e2e/fixtures/client-review-blocked.html");
    await expect(
      page.getByText("Asset type or size is not allowed."),
    ).toBeVisible();

    await page
      .locator("input[name=asset]")
      .setInputFiles("tests/e2e/fixtures/client-review-note.txt");
    await expect(page.getByRole("status")).toContainText(
      "client-review-note.txt attached.",
    );
    await expect(
      page.getByText("client-review-note.txt", { exact: true }),
    ).toBeVisible();
    await expect(page.getByText("text/plain")).toBeVisible();
  });

  test("lands client users on the reporting form and creates reports", async ({
    page,
  }) => {
    const suffix = Date.now();
    const bugTitle = `Client bug report ${suffix}`;
    const featureTitle = `Client feature request ${suffix}`;

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("client@digicolony.local");
    await page.getByLabel("Password").fill("ChangeMe123!");
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL("**/report");
    await expect(
      page.getByRole("heading", { name: "Tell us what needs attention" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { exact: true, name: "Report" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { exact: true, name: "Board" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "+ Add" })).toHaveCount(0);

    await page.goto("/clients");
    await page.waitForURL("**/work-items");

    await page.goto("/projects/seed-project-client-portal");
    await page.waitForURL(
      (url) =>
        url.pathname === "/work-items" &&
        url.searchParams.get("projectId") === "seed-project-client-portal",
    );

    await page.goto("/report");

    const form = page.getByTestId("client-report-form");
    await expect(form.locator("select[name=clientId]")).toHaveCount(0);
    await expect(
      form.locator("select[name=projectId] option", {
        hasText: "Patient Intake Modernization",
      }),
    ).toHaveCount(0);
    await form.locator("select[name=projectId]").selectOption({
      label: "Client Portal MVP",
    });
    await form.getByLabel("Short summary").fill(bugTitle);
    await form
      .getByLabel("What should we know?")
      .fill("The client reporting workflow test found a bug.");
    await form
      .getByLabel("Steps to reproduce")
      .fill("Open the report page and submit a bug.");
    await form
      .getByLabel("What did you expect?")
      .fill("The report should create a visible work item.");
    await form
      .getByLabel("What happened instead?")
      .fill("This is the actual behavior captured by the test.");
    await form.getByRole("button", { name: "Submit report" }).click();

    await page.waitForURL("**/work-items/**");
    await expect(page.getByRole("heading", { name: bugTitle })).toBeVisible();
    await expect(
      page.getByText("Reported", { exact: true }).first(),
    ).toBeVisible();

    await page.goto("/report");
    await page.getByRole("tab", { name: "Request a feature" }).click();
    const featureForm = page.getByTestId("client-report-form");
    await featureForm.locator("select[name=projectId]").selectOption({
      label: "Client Portal MVP",
    });
    await featureForm.getByLabel("Short summary").fill(featureTitle);
    await featureForm
      .getByLabel("What should we know?")
      .fill("The client reporting workflow test found a feature request.");
    await featureForm
      .getByLabel("Who needs this and why?")
      .fill("As a client stakeholder, I want a simpler entry point.");
    await featureForm
      .getByLabel("What would make this complete?")
      .fill("The request should appear on the board.");
    await featureForm
      .getByLabel("Business value")
      .fill("Clients do not need to learn the admin workflow.");
    await featureForm.getByRole("button", { name: "Submit report" }).click();

    await page.waitForURL("**/work-items/**");
    await expect(
      page.getByRole("heading", { name: featureTitle }),
    ).toBeVisible();
  });
});
