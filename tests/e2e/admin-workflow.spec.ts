import { expect, test } from "@playwright/test";

test.describe("admin workflow", () => {
  test("supports client, project, work item, project review, and status movement", async ({
    page
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
    await expect(page.getByRole("heading", { exact: true, name: "Board" })).toBeVisible();
    await expect(page.getByRole("link", { exact: true, name: "Board" })).toBeVisible();
    await expect(page.getByRole("link", { exact: true, name: "List" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Client portfolio" })).toHaveCount(0);
    await page.goto("/clients");

    await page.getByRole("button", { name: "+ Add" }).click();
    await page.getByRole("button", { exact: true, name: "Client" }).click();
    const createClientForm = page.getByTestId("global-create-client-form");
    await createClientForm.getByPlaceholder("Client name").fill(clientName);
    await createClientForm
      .getByPlaceholder("Description")
      .fill("Created by the admin workflow e2e test.");
    await createClientForm.getByRole("button", { name: "Create client" }).click();
    await page.getByRole("link", { name: clientName }).waitFor();

    await page.getByRole("button", { name: "+ Add" }).click();
    await page.getByRole("button", { exact: true, name: "Project" }).click();
    const createProjectForm = page.getByTestId("global-create-project-form");
    await createProjectForm.locator("select[name=clientId]").selectOption({
      label: clientName
    });
    await createProjectForm.getByPlaceholder("Project name").fill(projectName);
    await createProjectForm
      .getByPlaceholder("Description")
      .fill("Project created by the admin workflow e2e test.");
    await createProjectForm.getByRole("button", { name: "Create project" }).click();
    await page.goto("/work-items?view=list");
    await page.getByRole("link", { name: projectName }).click();
    await page.waitForURL("**/projects/**");
    await expect(page.getByText("Project Workspace")).toBeVisible();
    await expect(page.getByRole("heading", { name: projectName })).toBeVisible();

    const projectUrl = page.url();
    const projectId = projectUrl.split("/").pop();
    expect(projectId).toBeTruthy();

    await page.getByRole("button", { name: "+ Add" }).click();
    await page.getByTestId("global-add-bug").click();
    const projectWorkItemForm = page.getByTestId("global-create-work-item-form");
    await projectWorkItemForm.locator("select[name=projectId]").selectOption(projectId);
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
    await page.goto(projectUrl);

    const createdLink = page.getByRole("link", { name: workItemTitle }).first();
    await createdLink.waitFor();
    const href = await createdLink.getAttribute("href");
    const workItemId = href?.split("/").pop();
    expect(workItemId).toBeTruthy();

    await page.goto(`/work-items?projectId=${projectId}`);
    const projectWorkItemCard = page.getByTestId(`work-item-card-${workItemId}`);
    await projectWorkItemCard.dragTo(page.getByTestId("work-item-column-in_progress"));
    await page.getByTestId(`work-item-card-${workItemId}`).waitFor();

    await page.goto(`/work-items?view=list&projectId=${projectId}`);
    await page.getByTestId(`work-item-row-${workItemId}`).waitFor();
    await page.getByRole("link", { name: projectName }).click();
    await page.waitForURL("**/projects/**");
    await expect(page.getByRole("heading", { name: projectName })).toBeVisible();

    await page.goto(`/work-items?view=list&projectId=${projectId}`);
    await page.getByRole("link", { name: clientName }).click();
    await page.waitForURL("**/clients/**");
    await expect(page.getByRole("heading", { name: clientName })).toBeVisible();

    await page.goto(`/work-items?view=list&projectId=${projectId}`);
    await page.getByTestId(`work-item-row-${workItemId}`).waitFor();
    await expect(page.getByRole("link", { name: workItemTitle }).first()).toBeVisible();

    await page.goto(`/work-items?view=list&q=${encodeURIComponent(workItemTitle)}&type=BUG`);
    await page.getByTestId(`work-item-row-${workItemId}`).waitFor();
    await expect(page.getByText("1 visible items")).toBeVisible();
  });
});
