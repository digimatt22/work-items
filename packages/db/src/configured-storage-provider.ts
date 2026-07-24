import type { StorageProvider } from "@digicolony/shared";
import { createLocalStorageProvider } from "./local-storage-provider";
import {
  checkS3StorageReadiness,
  createS3StorageProvider,
  type S3StorageConfig,
} from "./s3-storage-provider";

type AssetStorageProvider = "LOCAL" | "S3";
type StorageEnvironment = Record<string, string | undefined>;

function required(environment: StorageEnvironment, name: string): string {
  const value = environment[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required for S3-compatible storage.`);
  }
  return value;
}

function configuredProvider(environment: StorageEnvironment): "local" | "s3" {
  const configured = (environment.STORAGE_PROVIDER ?? "local").toLowerCase();
  if (configured !== "local" && configured !== "s3") {
    throw new Error(`Unsupported STORAGE_PROVIDER: ${configured}`);
  }
  return configured;
}

function s3Config(environment: StorageEnvironment): S3StorageConfig {
  return {
    endpoint: required(environment, "S3_ENDPOINT"),
    region: required(environment, "S3_REGION"),
    bucket: required(environment, "S3_BUCKET"),
    accessKeyId: required(environment, "S3_ACCESS_KEY_ID"),
    secretAccessKey: required(environment, "S3_SECRET_ACCESS_KEY"),
    forcePathStyle: environment.S3_FORCE_PATH_STYLE !== "false",
  };
}

export async function checkConfiguredStorageReadiness(
  environment: StorageEnvironment = process.env,
  checkS3: (config: S3StorageConfig) => Promise<void> = checkS3StorageReadiness,
): Promise<void> {
  if (configuredProvider(environment) === "local") {
    return;
  }

  await checkS3(s3Config(environment));
}

export function createConfiguredStorageProvider(
  assetProvider?: AssetStorageProvider,
  environment: StorageEnvironment = process.env,
): StorageProvider {
  const configured = configuredProvider(environment);
  const selected = assetProvider ?? (configured === "s3" ? "S3" : "LOCAL");

  if (selected === "LOCAL") {
    return createLocalStorageProvider(environment.UPLOADS_DIR ?? "./uploads");
  }

  return createS3StorageProvider(s3Config(environment));
}
