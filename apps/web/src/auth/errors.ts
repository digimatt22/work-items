export function isCredentialsSignInError(
  error: unknown,
): error is { type: "CredentialsSignin" } {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "CredentialsSignin"
  );
}
