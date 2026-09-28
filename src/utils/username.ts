/**
 * Cleanses a raw username string by removing all characters except letters, numbers, and underscores,
 * and strictly enforces a maximum length of 30 characters.
 */
export function sanitizeUsername(input: string): string {
  return input.replace(/[^a-zA-Z0-9_]/g, "").slice(0, 30);
}

/**
 * Validates whether a username strictly contains only alphanumeric characters and underscores,
 * and meets length constraints (between 3 and 30 characters).
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
}
