import type { StorageProvider } from "@digicolony/shared";
import { createLocalStorageProvider } from "./local-storage-provider";
import { createS3StorageProvider } from "./s3-storage-provider";

type AssetStorageProvider = "LOCAL" | "S3";
type StorageEnvironment = Record<string, string | undefined>;

function required(environment: StorageEnvironment, name: string): string {
  const value = environment[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for S3-compatible storage.`);
  }
  return value;
}

export function createConfiguredStorageProvider(
  assetProvider?: AssetStorageProvider,
  environment: StorageEnvironment = process.env,
): StorageProvider {
  const configured = (environment.STORAGE_PROVIDER ?? "local").toLowerCase();
  if (!assetProvider && configured !== "local" && configured !== "s3") {
    throw new Error(`Unsupported STORAGE_PROVIDER: ${configured}`);
  }
  const selected = assetProvider ?? (configured === "s3" ? "S3" : "LOCAL");

  if (selected === "LOCAL") {
    return createLocalStorageProvider(environment.UPLOADS_DIR ?? "./uploads");
  }

  return createS3StorageProvider({
    endpoint: required(environment, "S3_ENDPOINT"),
    region: required(environment, "S3_REGION"),
    bucket: required(environment, "S3_BUCKET"),
    accessKeyId: required(environment, "S3_ACCESS_KEY_ID"),
    secretAccessKey: required(environment, "S3_SECRET_ACCESS_KEY"),
    forcePathStyle: environment.S3_FORCE_PATH_STYLE !== "false",
  });
}
