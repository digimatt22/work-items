export const assetConstraints = {
  maxFileSizeBytes: 100 * 1024 * 1024,
  maxFilesPerRequest: 10,
  allowedExtensions: [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "pdf",
    "txt",
    "md",
    "csv",
    "docx",
    "xlsx",
    "mp4",
    "mov",
    "webm",
    "log",
    "json",
    "zip"
  ],
  blockedExtensions: ["exe", "dmg", "pkg", "sh", "bat", "cmd", "ps1", "html", "htm"],
  previewPolicy: "IMAGE_ONLY"
} as const;

export type AssetPreviewPolicy = typeof assetConstraints.previewPolicy;
