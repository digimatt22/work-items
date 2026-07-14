import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const outDir =
  process.env.SCREENSHOT_DIR ??
  "docs/reviews/screenshots/phase-1f-workflow/refined";

async function screenshot(page, name) {
  await page.screenshot({
    animations: "disabled",
    fullPage: false,
    path: path.join(outDir, name)
  });
}

async function login(page) {
  await page.goto(`${baseURL}/sign-in`);
  await page.getByLabel("Email").fill("admin@digicolony.local");
  await page.getByLabel("Password").fill("ChangeMe123!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => url.pathname === "/work-items");
}

async function firstWorkItemDetail(page) {
  const projectCardLink = page
    .locator('[data-testid^="project-work-item-card-"] a[href^="/work-items/"]')
    .first();

  if ((await projectCardLink.count()) > 0) {
    await projectCardLink.click();
    await page.waitForURL("**/work-items/**");
    return;
  }

  await page.goto(`${baseURL}/work-items`);
  const boardCardLink = page
    .locator('[data-testid^="work-item-card-"] a[href^="/work-items/"]')
    .first();
  await boardCardLink.click();
  await page.waitForURL("**/work-items/**");
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome"
});

try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });

  await page.goto(`${baseURL}/sign-in`);
  await screenshot(page, "01-sign-in-desktop.png");

  await login(page);
  await page.getByRole("heading", { exact: true, name: "Board" }).waitFor();
  await screenshot(page, "02-board-desktop.png");

  await page.goto(`${baseURL}/work-items?view=list`);
  await page.getByRole("heading", { exact: true, level: 1, name: "List" }).waitFor();
  await screenshot(page, "02b-tree-list-desktop.png");

  await page.goto(`${baseURL}/clients`);
  await page.getByRole("heading", { name: "Client portfolio" }).waitFor();
  await screenshot(page, "03-clients-desktop.png");

  const clientLink = page.locator('article a[href^="/clients/"]').first();
  await clientLink.click();
  await page.waitForURL("**/clients/**");
  await page.getByText("Client Detail").waitFor();
  await screenshot(page, "04-client-detail-desktop.png");

  const projectLink = page
    .locator('[data-testid^="project-card-"] a[href^="/projects/"]')
    .first();
  await projectLink.click();
  await page.waitForURL("**/projects/**");
  await page.getByText("Project Workspace").waitFor();
  await screenshot(page, "05-project-workspace-desktop.png");

  await firstWorkItemDetail(page);
  await page.getByRole("heading", { name: "Work record" }).waitFor();
  await screenshot(page, "06-work-item-detail-desktop.png");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${baseURL}/work-items`);
  await page.getByRole("heading", { exact: true, name: "Board" }).waitFor();
  await screenshot(page, "07-board-mobile.png");
} finally {
  await browser.close();
}
