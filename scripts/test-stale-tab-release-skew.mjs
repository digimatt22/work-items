import { execFileSync } from "node:child_process";
import { chromium } from "@playwright/test";

const composeArgs = [
  "compose",
  "--project-name",
  "work-items-release-skew-test",
  "--file",
  "docker-compose.release-skew.yml",
];
const baseURL = "http://127.0.0.1:54081";
const replacementImage = process.env.WORK_ITEMS_REPLACEMENT_IMAGE;

if (!replacementImage) {
  throw new Error("WORK_ITEMS_REPLACEMENT_IMAGE is required.");
}

const browser = await chromium.launch({ channel: "chrome" });

try {
  const page = await browser.newPage();
  await page.goto(`${baseURL}/sign-in`);
  await page.getByLabel("Email").fill("not-a-user@example.test");
  await page
    .getByLabel("Password", { exact: true })
    .fill("definitely-not-the-password");

  execFileSync(
    "docker",
    [...composeArgs, "up", "--detach", "--force-recreate", "app"],
    {
      env: {
        ...process.env,
        WORK_ITEMS_IMAGE: replacementImage,
      },
      stdio: "inherit",
    },
  );

  for (let attempt = 1; attempt <= 60; attempt += 1) {
    try {
      const response = await fetch(`${baseURL}/api/health`, {
        signal: AbortSignal.timeout(2_000),
      });
      if (response.ok) {
        break;
      }
    } catch {
      // The replacement container is expected to be briefly unavailable.
    }
    if (attempt === 60) {
      throw new Error("Replacement release did not become healthy.");
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL(/\/sign-in\?error=credentials$/, {
    timeout: 30_000,
  });
  await page
    .getByText("Email or password is incorrect.", { exact: true })
    .waitFor();
  const content = await page.content();

  if (
    content.includes("Failed to find Server Action") ||
    content.includes("Application error")
  ) {
    throw new Error("The stale tab surfaced a Server Action failure.");
  }

  process.stdout.write("stale_tab_server_action_recovery=passed\n");
} finally {
  await browser.close();
}
