export type CreateClientUserResult =
  | {
      readonly ok: true;
      readonly credentials: {
        readonly username: string;
        readonly password: string;
      };
    }
  | { readonly ok: false; readonly message: string };

type ErrorWithCode = {
  readonly code?: unknown;
};

export function clientUserCreationErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null
      ? (error as ErrorWithCode).code
      : undefined;

  if (code === "P2002") {
    return "A user with this email already exists.";
  }

  if (code === "P2003" || code === "P2025") {
    return "The selected client is no longer available. Refresh and try again.";
  }

  if (
    error instanceof Error &&
    error.message === "Client user email and clientId are required."
  ) {
    return "Choose a client and enter an email address.";
  }

  if (
    error instanceof Error &&
    (error.message === "Authentication required." ||
      error.message === "Admin permission required.")
  ) {
    return "Your session is no longer authorized. Sign in again and retry.";
  }

  return "We could not create this client user. Please try again.";
}
