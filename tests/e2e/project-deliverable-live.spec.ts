import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const projectId = process.env.E2E_PROJECT_ID;
const sessionToken = process.env.E2E_SESSION_TOKEN;

async function authenticate(page: Page): Promise<void> {
  if (sessionToken) {
    await page.context().addCookies([
      {
        name: "__Secure-authjs.session-token",
        value: sessionToken,
        url: "https://portal.digicolony.net",
        httpOnly: true,
        secure: true,
        sameSite: "Lax",
      },
    ]);
    return;
  }

  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(adminEmail!);
  await page.getByLabel("Password", { exact: true }).fill(adminPassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("button", { name: "Sign out" }).waitFor();
}

test.describe("live project deliverable workflow", () => {
  test.setTimeout(90_000);
  test.skip(
    (!sessionToken && (!adminEmail || !adminPassword)) || !projectId,
    "A live administrator session or credentials and a project ID are required.",
  );

  test("stores in Garage and serves a protected no-login download", async ({
    browser,
    page,
  }) => {
    const suffix = Date.now();
    const filename = `garage-delivery-proof-${suffix}.txt`;
    const payload = `Garage-backed project delivery validation ${suffix}\n`;

    await authenticate(page);

    await page.goto(`/projects/${projectId}`);
    await expect(
      page.getByRole("heading", { name: "Client deliverables" }),
    ).toBeVisible();

    await page.locator('input[name="deliverable"]').setInputFiles({
      name: filename,
      mimeType: "text/plain",
      buffer: Buffer.from(payload),
    });
    await page.getByRole("button", { name: "Upload file" }).click();
    await expect(
      page.getByText(`${filename} is ready to share.`),
    ).toBeVisible();

    const deliverable = page.locator("article").filter({ hasText: filename });
    await expect(deliverable).toHaveCount(1);
    await deliverable.getByRole("button", { name: "Create link" }).click();

    const shareDetails = page
      .getByRole("status")
      .filter({ hasText: "Link and one-time password" });
    await expect(shareDetails).toBeVisible();
    const values = await shareDetails.locator("dd").allTextContents();
    expect(values).toHaveLength(2);
    const deliveryUrl = values[0]!.trim();
    const deliveryPassword = values[1]!.trim();

    const anonymousContext = await browser.newContext();
    const anonymousPage = await anonymousContext.newPage();
    await anonymousPage.goto(deliveryUrl);
    await anonymousPage
      .getByLabel("Download password")
      .fill("intentionally-wrong-password");
    await anonymousPage.getByRole("button", { name: "Download file" }).click();
    await expect(
      anonymousPage
        .getByRole("alert")
        .getByText("The file could not be downloaded."),
    ).toBeVisible();

    await anonymousPage.getByLabel("Download password").fill(deliveryPassword);
    const downloadPromise = anonymousPage.waitForEvent("download");
    await anonymousPage.getByRole("button", { name: "Download file" }).click();
    const download = await downloadPromise;
    expect(await readFile(await download.path(), "utf8")).toBe(payload);
    await anonymousContext.close();

    await deliverable.getByRole("button", { name: "Revoke" }).click();
    await expect(
      deliverable.getByText("Revoked", { exact: true }),
    ).toBeVisible();
  });

  test("revokes validation links left by interrupted runs", async ({
    page,
  }) => {
    await authenticate(page);
    await page.goto(`/projects/${projectId}`);

    const deliverables = page
      .locator("article")
      .filter({ hasText: "garage-delivery-proof-" });
    const deliverableCount = await deliverables.count();

    for (let index = 0; index < deliverableCount; index += 1) {
      const deliverable = deliverables.nth(index);
      const revoke = deliverable.getByRole("button", { name: "Revoke" });
      if ((await revoke.count()) === 1) {
        await revoke.click();
        await expect(
          deliverable.getByText("Revoked", { exact: true }),
        ).toBeVisible();
      }
    }
  });
});
