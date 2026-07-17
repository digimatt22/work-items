export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 128;

export type PasswordValidationError = "confirmation" | "length" | "required";

export function validateNewPassword(
  newPassword: string,
  confirmation: string,
): PasswordValidationError | null {
  if (!newPassword || !confirmation) {
    return "required";
  }

  if (newPassword !== confirmation) {
    return "confirmation";
  }

  if (
    newPassword.length < MIN_PASSWORD_LENGTH ||
    newPassword.length > MAX_PASSWORD_LENGTH
  ) {
    return "length";
  }

  return null;
}
