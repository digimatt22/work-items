import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const screenshotDir = "docs/reviews/screenshots/mvp-launch-readiness-production-2026-07-14";
const inventoryPath = "docs/reviews/mvp-launch-current-screen-action-inventory-2026-07-14.md";
const completionAuditPath = "docs/reviews/mvp-launch-completion-audit-2026-07-14.md";
const fixPassPath = "docs/reviews/mvp-launch-readiness-fix-pass-2026-07-14.md";

const expectedScreenshots = [
  "01-sign-in-desktop.png",
  "02-admin-board-desktop.png",
  "03-admin-board-hierarchy-filter-open.png",
  "04-admin-global-add-feature.png",
  "05-admin-list-desktop.png",
  "06-admin-clients-desktop.png",
  "07-admin-client-detail-desktop.png",
  "08-admin-client-context-edit.png",
  "09-admin-project-workspace-desktop.png",
  "10-admin-project-context-edit.png",
  "11-admin-work-item-detail-desktop.png",
  "12-admin-status-report-desktop.png",
  "13-admin-board-mobile.png",
  "14-client-report-bug-desktop.png",
  "15-client-report-feature-desktop.png",
  "16-client-board-desktop.png",
  "17-client-list-desktop.png",
  "18-client-clients-redirect-desktop.png",
  "19-client-client-detail-redirect-desktop.png",
  "20-client-project-redirect-desktop.png",
  "21-client-work-item-detail-desktop.png",
  "22-client-report-mobile.png"
];

const requiredDocs = [
  inventoryPath,
  completionAuditPath,
  fixPassPath,
  "docs/reviews/mvp-launch-pr-review-notes-2026-07-14.md",
  "docs/reviews/mvp-launch-human-validation-checklist-2026-07-14.md",
  "docs/reviews/mvp-launch-remote-pr-runbook-2026-07-14.md"
];

let failed = false;

function fail(message) {
  failed = true;
  console.error(message);
}

for (const docPath of requiredDocs) {
  if (!existsSync(docPath)) {
    fail(`Missing launch audit doc: ${docPath}`);
  }
}

if (!existsSync(screenshotDir)) {
  fail(`Missing screenshot directory: ${screenshotDir}`);
} else {
  const actualScreenshots = readdirSync(screenshotDir)
    .filter((file) => file.endsWith(".png"))
    .sort();
  const unexpectedScreenshots = actualScreenshots.filter((file) => !expectedScreenshots.includes(file));

  for (const screenshot of expectedScreenshots) {
    if (!existsSync(join(screenshotDir, screenshot))) {
      fail(`Missing expected screenshot: ${screenshot}`);
    }
  }

  if (unexpectedScreenshots.length > 0) {
    fail(`Unexpected screenshot files: ${unexpectedScreenshots.join(", ")}`);
  }

  if (actualScreenshots.length !== expectedScreenshots.length) {
    fail(`Expected ${expectedScreenshots.length} screenshots, found ${actualScreenshots.length}`);
  }
}

if (existsSync(inventoryPath)) {
  const inventory = readFileSync(inventoryPath, "utf8");
  for (const screenshot of expectedScreenshots) {
    if (!inventory.includes(screenshot)) {
      fail(`Inventory does not reference screenshot: ${screenshot}`);
    }
  }
}

if (existsSync(completionAuditPath)) {
  const completionAudit = readFileSync(completionAuditPath, "utf8");
  for (const phrase of [
    "No origin remote configured",
    "22 screenshots",
    "Matthew has not yet completed the human go/no-go checklist"
  ]) {
    if (!completionAudit.includes(phrase)) {
      fail(`Completion audit missing phrase: ${phrase}`);
    }
  }
}

if (existsSync(fixPassPath)) {
  const fixPass = readFileSync(fixPassPath, "utf8");
  for (const phrase of ["fresh-eyes sub-agent", "Status report", "no new screenshot-visible blocker"]) {
    if (!fixPass.includes(phrase)) {
      fail(`Fix-pass review missing phrase: ${phrase}`);
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Launch audit evidence check passed (${expectedScreenshots.length} screenshots)`);
