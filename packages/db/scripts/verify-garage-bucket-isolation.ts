import { verifyS3BucketIsolation } from "../src/s3-storage-provider";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

const result = await verifyS3BucketIsolation(
  {
    endpoint: required("S3_ENDPOINT"),
    region: required("S3_REGION"),
    bucket: required("S3_BUCKET"),
    accessKeyId: required("S3_ACCESS_KEY_ID"),
    secretAccessKey: required("S3_SECRET_ACCESS_KEY"),
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
  },
  required("GARAGE_DENIED_BUCKET"),
);

process.stdout.write(`${JSON.stringify(result)}\n`);
