import { execFileSync } from "node:child_process";
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const [schemaRevision] = process.argv.slice(2);
if (!schemaRevision) {
  throw new Error("Schema revision is required.");
}
if (
  process.env.SHELDON_BACKUP_INPUT !== "-" ||
  process.env.SHELDON_RESTORE_RESULT !== "-"
) {
  throw new Error("The Sheldon isolated restore contract is required.");
}

const restoreRoot = mkdtempSync(join(tmpdir(), "work-items-restore-"));
const dataDirectory = join(restoreRoot, "postgres");
const dumpPath = join(restoreRoot, "database.backup");
const socketDirectory = join(restoreRoot, "socket");
const port = "55439";
let started = false;

function postgres(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: "utf8",
    env: process.env,
    stdio: ["ignore", "pipe", "inherit"],
    ...options,
  });
}

try {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  writeFileSync(dumpPath, Buffer.concat(chunks), { mode: 0o600 });
  chmodSync(dumpPath, 0o600);

  postgres("mkdir", ["-p", socketDirectory]);
  postgres("initdb", [
    "--pgdata",
    dataDirectory,
    "--no-locale",
    "--encoding=UTF8",
    "--auth=trust",
  ]);
  postgres(
    "pg_ctl",
    [
      "--pgdata",
      dataDirectory,
      "--options",
      `-h '' -k ${socketDirectory} -p ${port}`,
      "--wait",
      "start",
    ],
    {
      stdio: ["ignore", "ignore", "inherit"],
    },
  );
  started = true;

  postgres("createdb", [
    "--host",
    socketDirectory,
    "--port",
    port,
    "work_items_restore",
  ]);
  postgres("pg_restore", [
    "--host",
    socketDirectory,
    "--port",
    port,
    "--dbname",
    "work_items_restore",
    "--no-owner",
    "--no-acl",
    "--exit-on-error",
    dumpPath,
  ]);

  const countsSql = `
SELECT json_build_object(
  'users', (SELECT count(*)::int FROM "User"),
  'password_credentials', (SELECT count(*)::int FROM "PasswordCredential"),
  'clients', (SELECT count(*)::int FROM "Client"),
  'projects', (SELECT count(*)::int FROM "Project"),
  'work_items', (SELECT count(*)::int FROM "WorkItem"),
  'assets', (SELECT count(*)::int FROM "Asset"),
  'asset_links', (SELECT count(*)::int FROM "AssetLink"),
  'deliverable_shares', (SELECT count(*)::int FROM "DeliverableShare"),
  'project_bindings', (SELECT count(*)::int FROM "ProjectBinding"),
  'oauth_access_grants', (SELECT count(*)::int FROM "McpAccessGrant")
)::text;
`;
  const protectedRows = JSON.parse(
    postgres("psql", [
      "--host",
      socketDirectory,
      "--port",
      port,
      "--dbname",
      "work_items_restore",
      "--no-psqlrc",
      "--no-align",
      "--tuples-only",
      "--set",
      "ON_ERROR_STOP=1",
      "--command",
      countsSql,
    ]).trim(),
  );

  process.stdout.write(
    `${JSON.stringify({
      schema: 1,
      schema_revision: schemaRevision,
      protected_rows: protectedRows,
    })}\n`,
  );
} finally {
  if (started) {
    try {
      postgres(
        "pg_ctl",
        ["--pgdata", dataDirectory, "--mode", "fast", "--wait", "stop"],
        {
          stdio: ["ignore", "ignore", "inherit"],
        },
      );
    } catch {
      // The parent Sheldon hook treats a missing result as a failed check.
    }
  }
  rmSync(restoreRoot, { recursive: true, force: true });
}
