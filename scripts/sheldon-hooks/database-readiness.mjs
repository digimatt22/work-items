import { execFileSync } from "node:child_process";

const [
  expectedVersion,
  expectedDatabase,
  expectedRuntimeRole,
  expectedMigrationRole,
  expectedConnectionLimit,
  cluster,
] = process.argv.slice(2);

if (
  !expectedVersion ||
  !expectedDatabase ||
  !expectedRuntimeRole ||
  !expectedMigrationRole ||
  !expectedConnectionLimit ||
  !cluster
) {
  throw new Error("Database readiness contract arguments are required.");
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

const parsedDatabaseUrl = new URL(databaseUrl);
if (!["postgres:", "postgresql:"].includes(parsedDatabaseUrl.protocol)) {
  throw new Error("DATABASE_URL must use PostgreSQL.");
}
const databasePassword = decodeURIComponent(parsedDatabaseUrl.password);
parsedDatabaseUrl.password = "";
parsedDatabaseUrl.searchParams.delete("schema");
const nativeDatabaseUrl = parsedDatabaseUrl.toString();

const sql = `
SELECT json_build_object(
  'version', current_setting('server_version'),
  'database', current_database(),
  'runtime_role', current_user,
  'runtime_role_limit', (
    SELECT rolconnlimit FROM pg_roles WHERE rolname = current_user
  ),
  'migration_role_exists', EXISTS (
    SELECT 1 FROM pg_roles WHERE rolname = '${expectedMigrationRole}'
  )
)::text;
`;

const observed = JSON.parse(
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
      sql,
    ],
    {
      encoding: "utf8",
      env: {
        ...process.env,
        PGPASSWORD: databasePassword,
        PGCONNECT_TIMEOUT: "5",
        PGOPTIONS: "-c statement_timeout=5000 -c lock_timeout=1000",
      },
      stdio: ["ignore", "pipe", "inherit"],
    },
  ).trim(),
);

if (
  observed.version.split(/\s+/, 1)[0] !== expectedVersion ||
  observed.database !== expectedDatabase ||
  observed.runtime_role !== expectedRuntimeRole ||
  observed.runtime_role_limit !== Number(expectedConnectionLimit) ||
  observed.migration_role_exists !== true
) {
  throw new Error("Database readiness metadata differs from the declaration.");
}

process.stdout.write(
  `${JSON.stringify({
    cluster,
    connection_limit: Number(expectedConnectionLimit),
    database: expectedDatabase,
    engine: "postgresql",
    health: "healthy",
    isolation_tier: "ordinary-internal",
    migration_role: expectedMigrationRole,
    profile: "external-postgresql",
    runtime_role: expectedRuntimeRole,
    version: expectedVersion,
  })}\n`,
);
