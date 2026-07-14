export interface PutObjectInput {
  readonly objectKey: string;
  readonly contentType: string;
  readonly bytes: Uint8Array;
  readonly metadata?: Record<string, string>;
}

export interface StoredObject {
  readonly provider: "local" | "s3";
  readonly objectKey: string;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly checksum?: string;
}

export interface GetObjectInput {
  readonly objectKey: string;
}

export interface DeleteObjectInput {
  readonly objectKey: string;
}

export interface SignedReadUrlInput {
  readonly objectKey: string;
  readonly expiresInSeconds: number;
}

export interface StorageProvider {
  putObject(input: PutObjectInput): Promise<StoredObject>;
  getObject(input: GetObjectInput): Promise<Uint8Array>;
  deleteObject(input: DeleteObjectInput): Promise<void>;
  getSignedReadUrl(input: SignedReadUrlInput): Promise<string>;
}
