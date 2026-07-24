import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { describe, expect, it, vi } from "vitest";
import {
  checkConfiguredStorageReadiness,
  createConfiguredStorageProvider,
} from "../src/configured-storage-provider";
import {
  checkS3StorageReadiness,
  createS3StorageProvider,
  verifyS3BucketIsolation,
} from "../src/s3-storage-provider";

const s3Environment = {
  STORAGE_PROVIDER: "s3",
  S3_ENDPOINT: "http://garage:3900",
  S3_REGION: "garage",
  S3_BUCKET: "digicolony-client-ops",
  S3_ACCESS_KEY_ID: "test-access-key",
  S3_SECRET_ACCESS_KEY: "test-secret-key",
  S3_FORCE_PATH_STYLE: "true",
};

describe("configured storage provider", () => {
  it("requires complete S3-compatible configuration", () => {
    expect(() =>
      createConfiguredStorageProvider(undefined, { STORAGE_PROVIDER: "s3" }),
    ).toThrow("S3_ENDPOINT is required");
  });

  it("fails closed on an unsupported provider name", () => {
    expect(() =>
      createConfiguredStorageProvider(undefined, {
        STORAGE_PROVIDER: "filesystem-typo",
      }),
    ).toThrow("Unsupported STORAGE_PROVIDER: filesystem-typo");
  });

  it("can still select local storage for legacy LOCAL asset records", async () => {
    const provider = createConfiguredStorageProvider("LOCAL", {
      ...s3Environment,
      UPLOADS_DIR: "/tmp/digicolony-storage-provider-test",
    });

    expect(
      await provider.getSignedReadUrl({
        objectKey: "legacy/file.txt",
        expiresInSeconds: 60,
      }),
    ).toBe("local://legacy/file.txt");
  });

  it("checks the configured S3 bucket without returning credential material", async () => {
    const checkS3 = vi.fn().mockResolvedValue(undefined);

    await expect(
      checkConfiguredStorageReadiness(s3Environment, checkS3),
    ).resolves.toBeUndefined();
    expect(checkS3).toHaveBeenCalledOnce();
    expect(checkS3.mock.calls[0]?.[0]).toMatchObject({
      bucket: "digicolony-client-ops",
      endpoint: "http://garage:3900",
    });
  });

  it("does not call S3 for the local provider", async () => {
    const checkS3 = vi.fn().mockResolvedValue(undefined);

    await expect(
      checkConfiguredStorageReadiness({ STORAGE_PROVIDER: "local" }, checkS3),
    ).resolves.toBeUndefined();
    expect(checkS3).not.toHaveBeenCalled();
  });
});

describe("S3-compatible storage provider", () => {
  it("puts, reads, deletes, and signs objects using the configured bucket", async () => {
    const send = vi
      .fn()
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ Body: new Uint8Array([4, 5, 6]) })
      .mockResolvedValueOnce({});
    const signReadUrl = vi.fn().mockResolvedValue("http://signed.example/file");
    const provider = createS3StorageProvider(
      {
        endpoint: s3Environment.S3_ENDPOINT,
        region: s3Environment.S3_REGION,
        bucket: s3Environment.S3_BUCKET,
        accessKeyId: s3Environment.S3_ACCESS_KEY_ID,
        secretAccessKey: s3Environment.S3_SECRET_ACCESS_KEY,
      },
      { client: { send } as never, signReadUrl },
    );

    const stored = await provider.putObject({
      objectKey: "projects/project-1/deliverables/file-1",
      contentType: "text/plain",
      bytes: new Uint8Array([1, 2, 3]),
    });
    const bytes = await provider.getObject({ objectKey: stored.objectKey });
    await provider.deleteObject({ objectKey: stored.objectKey });
    const signed = await provider.getSignedReadUrl({
      objectKey: stored.objectKey,
      expiresInSeconds: 90,
    });

    expect(stored).toMatchObject({
      provider: "s3",
      sizeBytes: 3,
      checksum:
        "039058c6f2c0cb492c533b0a4d14ef77cc0f78abccced5287d84a1a2011cfb81",
    });
    expect(bytes).toEqual(new Uint8Array([4, 5, 6]));
    expect(signed).toBe("http://signed.example/file");
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(PutObjectCommand);
    expect(send.mock.calls[1]?.[0]).toBeInstanceOf(GetObjectCommand);
    expect(send.mock.calls[2]?.[0]).toBeInstanceOf(DeleteObjectCommand);
    expect(signReadUrl.mock.calls[0]?.[2]).toBe(90);
  });

  it("checks bucket access without listing or reading objects", async () => {
    const send = vi.fn().mockResolvedValue({});

    await checkS3StorageReadiness(
      {
        endpoint: s3Environment.S3_ENDPOINT,
        region: s3Environment.S3_REGION,
        bucket: s3Environment.S3_BUCKET,
        accessKeyId: s3Environment.S3_ACCESS_KEY_ID,
        secretAccessKey: s3Environment.S3_SECRET_ACCESS_KEY,
      },
      { client: { send } as never },
    );

    expect(send).toHaveBeenCalledOnce();
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(HeadBucketCommand);
    expect(send.mock.calls[0]?.[0].input).toEqual({
      Bucket: "digicolony-client-ops",
    });
  });

  it("proves its own bucket works and a foreign application bucket is denied", async () => {
    const accessDenied = Object.assign(new Error("do not expose"), {
      $metadata: { httpStatusCode: 403 },
    });
    const send = vi
      .fn()
      .mockResolvedValueOnce({})
      .mockRejectedValueOnce(accessDenied);

    await expect(
      verifyS3BucketIsolation(
        {
          endpoint: s3Environment.S3_ENDPOINT,
          region: s3Environment.S3_REGION,
          bucket: s3Environment.S3_BUCKET,
          accessKeyId: s3Environment.S3_ACCESS_KEY_ID,
          secretAccessKey: s3Environment.S3_SECRET_ACCESS_KEY,
        },
        "another-application",
        { client: { send } as never },
      ),
    ).resolves.toEqual({
      ownBucketAccess: "ok",
      foreignBucketAccess: "denied",
      deniedStatus: 403,
    });
    expect(send.mock.calls[0]?.[0]).toBeInstanceOf(HeadBucketCommand);
    expect(send.mock.calls[1]?.[0]).toBeInstanceOf(ListObjectsV2Command);
  });

  it("fails when foreign-bucket access succeeds", async () => {
    const send = vi.fn().mockResolvedValue({});

    await expect(
      verifyS3BucketIsolation(
        {
          endpoint: s3Environment.S3_ENDPOINT,
          region: s3Environment.S3_REGION,
          bucket: s3Environment.S3_BUCKET,
          accessKeyId: s3Environment.S3_ACCESS_KEY_ID,
          secretAccessKey: s3Environment.S3_SECRET_ACCESS_KEY,
        },
        "another-application",
        { client: { send } as never },
      ),
    ).rejects.toThrow(
      "Configured storage credentials can access a foreign bucket.",
    );
  });
});
