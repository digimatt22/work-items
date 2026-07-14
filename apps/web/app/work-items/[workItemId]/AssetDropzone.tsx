"use client";

import { useActionState, useRef, useState, type DragEvent } from "react";

type UploadAssetState = {
  readonly message: string;
  readonly status: "idle" | "success" | "error";
};

type AssetDropzoneProps = {
  action: (state: UploadAssetState, formData: FormData) => Promise<UploadAssetState>;
  allowedExtensions: readonly string[];
  maxFileSizeBytes: number;
  workItemId: string;
};

const initialUploadAssetState: UploadAssetState = {
  message: "",
  status: "idle"
};

function extensionFor(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function formatMegabytes(bytes: number): string {
  return `${Math.floor(bytes / (1024 * 1024))} MB`;
}

export function AssetDropzone({
  action,
  allowedExtensions,
  maxFileSizeBytes,
  workItemId
}: AssetDropzoneProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, formAction, pending] = useActionState(action, initialUploadAssetState);
  const [dragging, setDragging] = useState(false);
  const [localState, setLocalState] = useState<UploadAssetState | null>(null);
  const displayedState = localState ?? state;
  const allowedExtensionSet = new Set(allowedExtensions);
  const allowedExtensionSummary = allowedExtensions.map((extension) => `.${extension}`).join(", ");

  function submitFiles(files: FileList | null) {
    const file = files?.item(0);

    if (!file || !inputRef.current || !formRef.current) {
      return;
    }

    if (file.size > maxFileSizeBytes) {
      setLocalState({
        message: `Files must be ${formatMegabytes(maxFileSizeBytes)} or smaller.`,
        status: "error"
      });
      inputRef.current.value = "";
      return;
    }

    if (!allowedExtensionSet.has(extensionFor(file.name))) {
      setLocalState({
        message: "Asset type or size is not allowed.",
        status: "error"
      });
      inputRef.current.value = "";
      return;
    }

    setLocalState(null);

    const transfer = new DataTransfer();
    transfer.items.add(file);
    inputRef.current.files = transfer.files;
    formRef.current.requestSubmit();
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    submitFiles(event.dataTransfer.files);
  }

  return (
    <form action={formAction} className="mt-8" ref={formRef}>
      <input name="workItemId" type="hidden" value={workItemId} />
      <label
        className={[
          "flex min-h-28 cursor-pointer items-center justify-center rounded-md border border-dashed px-4 text-center text-sm font-semibold transition",
          dragging
            ? "border-indigo-400 bg-blue-soft text-indigo-700"
            : "border-line bg-[#fbfcff] text-muted hover:border-indigo-300 hover:bg-blue-soft"
        ].join(" ")}
        onDragLeave={() => setDragging(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDrop={handleDrop}
      >
        <input
          className="sr-only"
          name="asset"
          onChange={(event) => submitFiles(event.currentTarget.files)}
          accept={allowedExtensions.map((extension) => `.${extension}`).join(",")}
          ref={inputRef}
          required
          type="file"
        />
        {pending ? "Uploading file..." : "Drag and drop files here or click to select files"}
      </label>
      <p className="mt-2 text-xs leading-5 text-soft">
        Allowed: {allowedExtensionSummary}. Max {formatMegabytes(maxFileSizeBytes)}.
      </p>
      {displayedState.status !== "idle" ? (
        <p
          className={[
            "mt-2 text-xs font-semibold",
            displayedState.status === "error" ? "text-rose-600" : "text-emerald-700"
          ].join(" ")}
          role={displayedState.status === "error" ? "alert" : "status"}
        >
          {displayedState.message}
        </p>
      ) : null}
    </form>
  );
}
