import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { StorageProvider, StoredObject } from "@digicolony/shared";

export function createLocalStorageProvider(rootDir: string): StorageProvider {
  return {
    async putObject(input): Promise<StoredObject> {
      const objectKey = input.objectKey || randomUUID();
      const fullPath = join(rootDir, objectKey);

      await mkdir(dirname(fullPath), { recursive: true });
      await writeFile(fullPath, input.bytes);

      return {
        provider: "local",
        objectKey,
        contentType: input.contentType,
        sizeBytes: input.bytes.byteLength,
        checksum: createHash("sha256").update(input.bytes).digest("hex")
      };
    },
    async getObject(input): Promise<Uint8Array> {
      return readFile(join(rootDir, input.objectKey));
    },
    async deleteObject(input): Promise<void> {
      await rm(join(rootDir, input.objectKey), { force: true });
    },
    async getSignedReadUrl(input): Promise<string> {
      return `local://${input.objectKey}`;
    }
  };
}
