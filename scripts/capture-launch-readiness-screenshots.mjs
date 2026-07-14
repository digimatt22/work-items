import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const outDir =
  process.env.SCREENSHOT_DIR ??
  "docs/reviews/screenshots/mvp-launch-readiness";
const channel = process.env.PLAYWRIGHT_CHANNEL ?? "chrome";

async function screenshot(page, name) {
  await page.screenshot({
    animations: "disabled",
    fullPage: false,
    path: path.join(outDir, name)
  });
}

async function login(page, email) {
  await page.goto(`${baseURL}/sign-in`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("ChangeMe123!");
  await page.getByRole("button", { name: /sign in/i }).click();
}

async function captureAdmin(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 980 } });
  const page = await context.newPage();

  await page.goto(`${baseURL}/sign-in`);
  await screenshot(page, "01-sign-in-desktop.png");

  await login(page, "admin@digicolony.local");
  await page.waitForURL("**/work-items");
  await page.getByRole("heading", { exact: true, name: "Board" }).waitFor();
  await screenshot(page, "02-admin-board-desktop.png");

  await page.getByRole("button", { name: "Any client or project" }).click();
  await page.getByRole("button", { exact: true, name: "DigiColony Demo Client" }).waitFor();
  await screenshot(page, "03-admin-board-hierarchy-filter-open.png");

  await page.getByRole("button", { name: "+ Add" }).click();
  await page.getByRole("heading", { exact: true, name: "Feature" }).waitFor();
  await screenshot(page, "04-admin-global-add-feature.png");
  await page.getByRole("button", { name: "Close" }).click();

  await page.goto(`${baseURL}/work-items?view=list`);
  await page.getByRole("heading", { exact: true, level: 1, name: "List" }).waitFor();
  await screenshot(page, "05-admin-list-desktop.png");

  await page.goto(`${baseURL}/clients`);
  await page.getByRole("heading", { name: "Client portfolio" }).waitFor();
  await screenshot(page, "06-admin-clients-desktop.png");

  await page.goto(`${baseURL}/clients/seed-client-digicolony-demo`);
  await page.getByText("Client Detail").waitFor();
  await screenshot(page, "07-admin-client-detail-desktop.png");

  await page.getByText("Client context", { exact: true }).click();
  await page.getByRole("button", { name: "Save client" }).waitFor();
  await screenshot(page, "08-admin-client-context-edit.png");

  await page.goto(`${baseURL}/projects/seed-project-client-portal`);
  await page.getByText("Project Workspace").waitFor();
  await screenshot(page, "09-admin-project-workspace-desktop.png");

  await page.getByText("Project context", { exact: true }).click();
  await page.getByRole("button", { name: "Save project" }).waitFor();
  await screenshot(page, "10-admin-project-context-edit.png");

  await page.goto(`${baseURL}/work-items/seed-work-item-client-nav`);
  await page.getByRole("heading", { name: "Work record" }).waitFor();
  await screenshot(page, "11-admin-work-item-detail-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/work-items`);
  await page.getByRole("heading", { exact: true, name: "Board" }).waitFor();
  await screenshot(page, "12-admin-board-mobile.png");

  await context.close();
}

async function captureClient(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 980 } });
  const page = await context.newPage();

  await login(page, "client@digicolony.local");
  await page.waitForURL("**/report");
  await page.getByRole("heading", { name: "Tell us what needs attention" }).waitFor();
  await screenshot(page, "13-client-report-bug-desktop.png");

  await page.getByRole("tab", { name: "Request a feature" }).click();
  await screenshot(page, "14-client-report-feature-desktop.png");

  await page.goto(`${baseURL}/work-items`);
  await page.getByRole("heading", { exact: true, name: "Board" }).waitFor();
  await screenshot(page, "15-client-board-desktop.png");

  await page.goto(`${baseURL}/work-items?view=list`);
  await page.getByRole("heading", { exact: true, level: 1, name: "List" }).waitFor();
  await screenshot(page, "16-client-list-desktop.png");

  await page.goto(`${baseURL}/clients`);
  await page.waitForURL("**/work-items");
  await page.getByRole("heading", { exact: true, name: "Board" }).waitFor();
  await screenshot(page, "17-client-clients-redirect-desktop.png");

  await page.goto(`${baseURL}/clients/seed-client-digicolony-demo`);
  await page.waitForURL("**/work-items");
  await page.getByRole("heading", { exact: true, name: "Board" }).waitFor();
  await screenshot(page, "18-client-client-detail-redirect-desktop.png");

  await page.goto(`${baseURL}/projects/seed-project-client-portal`);
  await page.waitForURL((url) =>
    url.pathname === "/work-items" &&
    url.searchParams.get("projectId") === "seed-project-client-portal"
  );
  await page.getByRole("heading", { exact: true, name: "Board" }).waitFor();
  await screenshot(page, "19-client-project-redirect-desktop.png");

  await page.goto(`${baseURL}/work-items/seed-client-report-feature`);
  await page.getByRole("heading", { name: "Request details" }).waitFor();
  await screenshot(page, "20-client-work-item-detail-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/report`);
  await page.getByRole("heading", { name: "Tell us what needs attention" }).waitFor();
  await screenshot(page, "21-client-report-mobile.png");

  await context.close();
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ channel });

try {
  await captureAdmin(browser);
  await captureClient(browser);
} finally {
  await browser.close();
}
