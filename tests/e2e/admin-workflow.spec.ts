import { expect, test } from "@playwright/test";

test.describe("admin workflow", () => {
  test("creates client users and keeps duplicate-email failures in the form", async ({
    browser,
    page,
  }) => {
    const email = `client-user-${Date.now()}@example.test`;
    const clientName = "DigiColony Demo Client";

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("admin@digicolony.local");
    await page.getByLabel("Password").fill("ChangeMe123!");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.getByRole("button", { name: "Sign out" }).waitFor();
    await page.goto("/clients");

    const openClientUserForm = async () => {
      await page.getByRole("button", { name: "+ Add" }).click();
      await page.getByTestId("global-add-user").click();
      const form = page.getByTestId("global-create-client-user-form");
      await form.locator("select[name=clientId]").selectOption({
        label: clientName,
      });
      await form.getByPlaceholder("Email").fill(email);
      await form.getByPlaceholder("Name").fill("Client User Test");
      return form;
    };

    const createForm = await openClientUserForm();
    await createForm.getByRole("button", { name: "Create user" }).click();
    await expect(createForm).toBeHidden();
    const credentials = page.getByTestId("client-user-credentials");
    await expect(credentials).toBeVisible();
    await expect(credentials.getByLabel("Username")).toHaveValue(email);
    const temporaryPassword = await credentials
      .getByLabel("Temporary password")
      .inputValue();
    expect(temporaryPassword).toHaveLength(20);
    await credentials.getByRole("button", { name: "Copy credentials" }).click();
    await expect(
      credentials.getByRole("button", { name: "Credentials copied" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();

    await page.getByRole("link", { name: clientName, exact: true }).click();
    await expect(page.getByText(email, { exact: true })).toBeVisible();

    const duplicateForm = await openClientUserForm();
    await duplicateForm.getByRole("button", { name: "Create user" }).click();
    await expect(
      duplicateForm
        .getByRole("alert")
        .getByText("A user with this email already exists.", { exact: true }),
    ).toBeVisible();
    await expect(duplicateForm).toBeVisible();
    await expect(page.getByText("Application error")).toHaveCount(0);

    await page.getByRole("button", { name: "Close" }).click();
    const clientContext = await browser.newContext();
    const clientPage = await clientContext.newPage();
    await clientPage.goto("/sign-in");
    await clientPage.getByLabel("Email").fill(email);
    await clientPage.getByLabel("Password").fill(temporaryPassword);
    await clientPage.getByRole("button", { name: /sign in/i }).click();
    await clientPage.waitForURL("**/settings/password?required=1");
    await expect(
      clientPage.getByRole("heading", { name: "Set a new password" }),
    ).toBeVisible();

    await clientPage.goto("/report");
    await clientPage.waitForURL("**/settings/password?required=1");

    const newPassword = "ClientPassword#2026";
    await clientPage.getByLabel("Current password").fill(temporaryPassword);
    await clientPage
      .getByLabel("New password", { exact: true })
      .fill(newPassword);
    await clientPage.getByLabel("Confirm new password").fill(newPassword);
    await clientPage.getByRole("button", { name: "Change password" }).click();
    await clientPage.waitForURL("**/sign-in?passwordChanged=1");

    await clientPage.getByLabel("Email").fill(email);
    await clientPage.getByLabel("Password").fill(newPassword);
    await clientPage.getByRole("button", { name: /sign in/i }).click();
    await clientPage.waitForURL("**/report");
    await clientContext.close();
  });

  test("supports client, project, work item, project review, and status movement", async ({
    page,
  }) => {
    const suffix = Date.now();
    const clientName = `E2E Client ${suffix}`;
    const projectName = `E2E Project ${suffix}`;
    const workItemTitle = `E2E Work Item ${suffix}`;

    await page.goto("/sign-in");
    await page.getByLabel("Email").fill("admin@digicolony.local");
    await page.getByLabel("Password").fill("ChangeMe123!");
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.getByRole("button", { name: "Sign out" }).waitFor();
    await expect(
      page.getByRole("heading", { exact: true, name: "Board" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { exact: true, name: "Board" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { exact: true, name: "List" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Client portfolio" }),
    ).toHaveCount(0);
    await page.goto("/clients");

    await page.getByRole("button", { name: "+ Add" }).click();
    await page.getByTestId("global-add-client").click();
    const createClientForm = page.getByTestId("global-create-client-form");
    await createClientForm.getByPlaceholder("Client name").fill(clientName);
    await createClientForm
      .getByPlaceholder("Description")
      .fill("Created by the admin workflow e2e test.");
    await createClientForm
      .getByRole("button", { name: "Create client" })
      .click();
    await expect(createClientForm).toBeHidden();
    await page.getByRole("link", { name: clientName }).waitFor();

    await page.getByRole("button", { name: "+ Add" }).click();
    await page.getByTestId("global-add-project").click();
    const createProjectForm = page.getByTestId("global-create-project-form");
    await createProjectForm.locator("select[name=clientId]").selectOption({
      label: clientName,
    });
    await createProjectForm.getByPlaceholder("Project name").fill(projectName);
    await createProjectForm
      .getByPlaceholder("Description")
      .fill("Project created by the admin workflow e2e test.");
    await createProjectForm
      .getByRole("button", { name: "Create project" })
      .click();
    await expect(createProjectForm).toBeHidden();
    await page.goto("/work-items?view=list");
    await page.getByRole("link", { name: projectName }).click();
    await page.waitForURL("**/projects/**");
    await expect(page.getByText("Project Workspace")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: projectName }),
    ).toBeVisible();

    const projectUrl = page.url();
    const projectId = projectUrl.split("/").pop();
    expect(projectId).toBeTruthy();

    await page.getByRole("button", { name: "+ Add" }).click();
    await page.getByTestId("global-add-bug").click();
    const projectWorkItemForm = page.getByTestId(
      "global-create-work-item-form",
    );
    const workItemClientSelect = projectWorkItemForm.locator(
      "select[name=clientId]",
    );
    const workItemProjectSelect = projectWorkItemForm.locator(
      "select[name=projectId]",
    );
    await expect(workItemProjectSelect).toBeDisabled();
    await workItemClientSelect.selectOption({ label: clientName });
    await expect(workItemProjectSelect).toBeEnabled();
    await expect(
      workItemProjectSelect.locator(`option[value="${projectId}"]`),
    ).toHaveText(projectName);
    await workItemProjectSelect.selectOption(projectId);
    await workItemClientSelect.selectOption({
      label: "DigiColony Demo Client",
    });
    await expect(workItemProjectSelect).toHaveValue("");
    await expect(
      workItemProjectSelect.locator(`option[value="${projectId}"]`),
    ).toHaveCount(0);
    await workItemClientSelect.selectOption({ label: clientName });
    await workItemProjectSelect.selectOption(projectId);
    await projectWorkItemForm.getByPlaceholder("Title").fill(workItemTitle);
    await projectWorkItemForm
      .getByPlaceholder("Description")
      .fill("Created from the project workspace.");
    await projectWorkItemForm
      .getByPlaceholder("Steps to reproduce")
      .fill("Open the project workspace.");
    await projectWorkItemForm
      .getByPlaceholder("Expected behavior")
      .fill("A project-scoped work item appears.");
    await projectWorkItemForm
      .getByPlaceholder("Actual behavior")
      .fill("The item can be moved by an admin.");
    await projectWorkItemForm.getByRole("button", { name: "Create" }).click();
    await expect(projectWorkItemForm).toBeHidden();
    await page.goto(projectUrl);

    const createdLink = page.getByRole("link", { name: workItemTitle }).first();
    await createdLink.waitFor();
    const href = await createdLink.getAttribute("href");
    const workItemId = href?.split("/").pop();
    expect(workItemId).toBeTruthy();

    await page.goto(`/work-items?projectId=${projectId}`);
    const projectWorkItemCard = page.getByTestId(
      `work-item-card-${workItemId}`,
    );
    await projectWorkItemCard.dragTo(
      page.getByTestId("work-item-column-in_progress"),
    );
    await page.getByTestId(`work-item-card-${workItemId}`).waitFor();

    await page.goto(`/work-items?view=list&projectId=${projectId}`);
    await page.getByTestId(`work-item-row-${workItemId}`).waitFor();
    await page.getByRole("link", { name: projectName }).click();
    await page.waitForURL("**/projects/**");
    await expect(
      page.getByRole("heading", { name: projectName }),
    ).toBeVisible();

    await page.goto(`/work-items?view=list&projectId=${projectId}`);
    await page.getByRole("link", { name: clientName }).click();
    await page.waitForURL("**/clients/**");
    await expect(page.getByRole("heading", { name: clientName })).toBeVisible();

    await page.goto(`/work-items?view=list&projectId=${projectId}`);
    await page.getByTestId(`work-item-row-${workItemId}`).waitFor();
    await expect(
      page.getByRole("link", { name: workItemTitle }).first(),
    ).toBeVisible();

    await page.goto(
      `/work-items?view=list&q=${encodeURIComponent(workItemTitle)}&type=BUG`,
    );
    await page.getByTestId(`work-item-row-${workItemId}`).waitFor();
    await expect(page.getByText("1 visible items")).toBeVisible();
  });
});
