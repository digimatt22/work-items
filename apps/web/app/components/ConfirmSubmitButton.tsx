"use client";

import type { ComponentPropsWithoutRef } from "react";
import { buttonClass } from "./ui";

export function ConfirmSubmitButton({
  message,
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<"button"> & { message: string }) {
  return (
    <button
      {...props}
      className={className ?? buttonClass("danger")}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
      type={props.type ?? "submit"}
    >
      {children}
    </button>
  );
}

