"use client";

import { useState } from "react";
import { buttonClass, fieldClass } from "../../components/ui";

type WorkItemComment = {
  authorId: string;
  body: string;
  createdAt: string;
  id: string;
};

type WorkItemCommentsProps = {
  action: (formData: FormData) => void | Promise<void>;
  comments: readonly WorkItemComment[];
  workItemId: string;
};

export function WorkItemComments({
  action,
  comments,
  workItemId
}: WorkItemCommentsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        className="text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        + Add comment
      </button>
      {open ? (
        <form action={action} className="mt-3" onSubmit={() => setOpen(false)}>
          <input name="workItemId" type="hidden" value={workItemId} />
          <textarea
            className={fieldClass}
            name="body"
            placeholder="Add a comment. Mentions like @matt are captured."
            required
            rows={5}
          />
          <div className="mt-3 flex gap-2">
            <button className={buttonClass("primary")} type="submit">
              Add comment
            </button>
            <button className={buttonClass("secondary")} onClick={() => setOpen(false)} type="button">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-4 divide-y divide-line overflow-hidden rounded-md border border-line bg-white">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4">
            <p className="text-sm leading-6 text-muted">{comment.body}</p>
            <p className="mt-1 text-xs text-soft">
              {comment.authorId} / {comment.createdAt}
            </p>
          </div>
        ))}
        {comments.length === 0 ? (
          <div className="p-4 text-sm text-soft">
            No comments yet.
          </div>
        ) : null}
      </div>
    </div>
  );
}
