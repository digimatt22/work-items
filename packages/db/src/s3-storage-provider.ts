import { createHash, randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageProvider, StoredObject } from "@digicolony/shared";

export interface S3StorageConfig {
  readonly endpoint: string;
  readonly region: string;
  readonly bucket: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly forcePathStyle?: boolean;
}

type S3ClientLike = Pick<S3Client, "send">;

type S3StorageDependencies = {
  readonly client?: S3ClientLike;
  readonly signReadUrl?: (
    client: S3ClientLike,
    command: GetObjectCommand,
    expiresIn: number,
  ) => Promise<string>;
};

export async function checkS3StorageReadiness(
  config: S3StorageConfig,
  dependencies: Pick<S3StorageDependencies, "client"> = {},
): Promise<void> {
  const client = dependencies.client ?? new S3Client(clientConfig(config));

  await client.send(new HeadBucketCommand({ Bucket: config.bucket }));
}

export interface S3BucketIsolationResult {
  readonly ownBucketAccess: "ok";
  readonly foreignBucketAccess: "denied";
  readonly deniedStatus: 403;
}

export async function verifyS3BucketIsolation(
  config: S3StorageConfig,
  foreignBucket: string,
  dependencies: Pick<S3StorageDependencies, "client"> = {},
): Promise<S3BucketIsolationResult> {
  if (!foreignBucket || foreignBucket === config.bucket) {
    throw new Error(
      "A distinct existing foreign bucket is required for isolation verification.",
    );
  }

  const client = dependencies.client ?? new S3Client(clientConfig(config));
  await client.send(new HeadBucketCommand({ Bucket: config.bucket }));

  try {
    await client.send(
      new ListObjectsV2Command({
        Bucket: foreignBucket,
        MaxKeys: 1,
      }),
    );
  } catch (error) {
    const status =
      typeof error === "object" &&
      error !== null &&
      "$metadata" in error &&
      typeof error.$metadata === "object" &&
      error.$metadata !== null &&
      "httpStatusCode" in error.$metadata
        ? error.$metadata.httpStatusCode
        : undefined;

    if (status === 403) {
      return {
        ownBucketAccess: "ok",
        foreignBucketAccess: "denied",
        deniedStatus: 403,
      };
    }

    throw new Error(
      "Foreign-bucket isolation did not return an explicit access denial.",
    );
  }

  throw new Error(
    "Configured storage credentials can access a foreign bucket.",
  );
}

function clientConfig(config: S3StorageConfig): S3ClientConfig {
  return {
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: config.forcePathStyle ?? true,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  };
}

export function createS3StorageProvider(
  config: S3StorageConfig,
  dependencies: S3StorageDependencies = {},
): StorageProvider {
  const client = dependencies.client ?? new S3Client(clientConfig(config));
  const signReadUrl =
    dependencies.signReadUrl ??
    ((target, command, expiresIn) =>
      getSignedUrl(target as S3Client, command, { expiresIn }));

  return {
    async putObject(input): Promise<StoredObject> {
      const objectKey = input.objectKey || randomUUID();
      const checksum = createHash("sha256").update(input.bytes).digest("hex");

      await client.send(
        new PutObjectCommand({
          Bucket: config.bucket,
          Key: objectKey,
          Body: input.bytes,
          ContentType: input.contentType,
          Metadata: { ...input.metadata, sha256: checksum },
        }),
      );

      return {
        provider: "s3",
        objectKey,
        contentType: input.contentType,
        sizeBytes: input.bytes.byteLength,
        checksum,
      };
    },

    async getObject(input): Promise<Uint8Array> {
      const response = await client.send(
        new GetObjectCommand({ Bucket: config.bucket, Key: input.objectKey }),
      );
      const body = response.Body;

      if (!body) {
        throw new Error(`Stored object has no body: ${input.objectKey}`);
      }
      if (body instanceof Uint8Array) {
        return body;
      }
      if ("transformToByteArray" in body) {
        return body.transformToByteArray();
      }

      throw new Error(`Stored object body cannot be read: ${input.objectKey}`);
    },

    async deleteObject(input): Promise<void> {
      await client.send(
        new DeleteObjectCommand({
          Bucket: config.bucket,
          Key: input.objectKey,
        }),
      );
    },

    async getSignedReadUrl(input): Promise<string> {
      return signReadUrl(
        client,
        new GetObjectCommand({
          Bucket: config.bucket,
          Key: input.objectKey,
        }),
        input.expiresInSeconds,
      );
    },
  };
}
