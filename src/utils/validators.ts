/**
 * Utility functions for user input validation
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export interface EmailValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Validates an email address against format and presence rules.
 */
export const validateEmail = (email: string): EmailValidationResult => {
  const trimmed = email.trim();

  if (!trimmed) {
    return {
      isValid: false,
      error: "EMAIL IS REQUIRED",
    };
  }

  if (!trimmed.includes("@")) {
    return {
      isValid: false,
      error: "MISSING '@' SYMBOL IN IDENTIFIER",
    };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: "INVALID EMAIL FORMAT (EX: USER@DOMAIN.COM)",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};
