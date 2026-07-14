"use client";

import { useRef, useState, type DragEvent } from "react";

type AssetDropzoneProps = {
  action: (formData: FormData) => void | Promise<void>;
  workItemId: string;
};

export function AssetDropzone({ action, workItemId }: AssetDropzoneProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function submitFiles(files: FileList | null) {
    const file = files?.item(0);

    if (!file || !inputRef.current || !formRef.current) {
      return;
    }

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
    <form action={action} className="mt-8" ref={formRef}>
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
          ref={inputRef}
          required
          type="file"
        />
        Drag and drop files here or click to select files
      </label>
    </form>
  );
}
