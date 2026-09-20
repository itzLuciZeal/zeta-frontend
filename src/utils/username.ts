/**
 * Cleanses a raw username string by removing all characters except letters and numbers,
 * and strictly enforces a maximum length of 30 characters.
 */
export function sanitizeUsername(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, "").slice(0, 30);
}

/**
 * Validates whether a username strictly contains only alphanumeric characters
 * and meets length constraints (between 3 and 30 characters).
 */
export function isValidUsername(username: string): boolean {
  const alphanumericRegex = /^[a-zA-Z0-9]{3,30}$/;
  return alphanumericRegex.test(username);
}
