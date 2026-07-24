import { execFileSync, spawn } from "node:child_process";
import { once } from "node:events";

const [schemaRevision] = process.argv.slice(2);
if (!schemaRevision) {
  throw new Error("Schema revision is required.");
}
if (
  process.env.SHELDON_BACKUP_OUTPUT !== "-" ||
  process.env.SHELDON_BACKUP_PROTOCOL !== "sheldon-envelope-v1"
) {
  throw new Error("The Sheldon backup envelope contract is required.");
}

const databaseUrl = process.env.DATABASE_BACKUP_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_BACKUP_URL is required.");
}

const parsedDatabaseUrl = new URL(databaseUrl);
if (!["postgres:", "postgresql:"].includes(parsedDatabaseUrl.protocol)) {
  throw new Error("DATABASE_BACKUP_URL must use PostgreSQL.");
}
const databasePassword = decodeURIComponent(parsedDatabaseUrl.password);
parsedDatabaseUrl.password = "";
parsedDatabaseUrl.searchParams.delete("schema");
const nativeDatabaseUrl = parsedDatabaseUrl.toString();

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
  execFileSync(
    "psql",
    [
      nativeDatabaseUrl,
      "-X",
      "--no-psqlrc",
      "--no-align",
      "--tuples-only",
      "--set",
      "ON_ERROR_STOP=1",
      "--command",
      countsSql,
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        PGPASSWORD: databasePassword,
        PGCONNECT_TIMEOUT: "5",
        PGOPTIONS: "-c statement_timeout=10000 -c lock_timeout=1000",
      },
      stdio: ["ignore", "pipe", "inherit"],
    },
  ).trim(),
);

const metadata = Buffer.from(
  JSON.stringify({
    schema: 1,
    schema_revision: schemaRevision,
    protected_rows: protectedRows,
  }),
).toString("base64url");

process.stdout.write(`SHELDON-BACKUP-METADATA ${metadata}\n`);

const dump = spawn(
  "pg_dump",
  [
    nativeDatabaseUrl,
    "--format=custom",
    "--compress=6",
    "--no-owner",
    "--no-acl",
  ],
  {
    env: {
      ...process.env,
      PGPASSWORD: databasePassword,
      PGCONNECT_TIMEOUT: "5",
      PGOPTIONS: "-c statement_timeout=0 -c lock_timeout=1000",
    },
    stdio: ["ignore", "pipe", "inherit"],
  },
);

const exitPromise = new Promise((resolve, reject) => {
  dump.once("error", reject);
  dump.once("close", resolve);
});

for await (const chunk of dump.stdout) {
  if (!process.stdout.write(chunk)) {
    await once(process.stdout, "drain");
  }
}

const exitCode = await exitPromise;
if (exitCode !== 0) {
  throw new Error(`pg_dump exited with status ${exitCode}.`);
}
