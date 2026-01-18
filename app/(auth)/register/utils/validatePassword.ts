export interface PasswordValidationResult {
  isValid: boolean;
  errorKey: string | null;
}

export interface PasswordChecks {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
}

/**
 * Validates a password against security requirements.
 * Returns an error translation key if validation fails, null if valid.
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'auth.register.passwordTooShort';
  }
  if (!/[A-Z]/.test(password)) {
    return 'auth.register.passwordNeedsUppercase';
  }
  if (!/[0-9]/.test(password)) {
    return 'auth.register.passwordNeedsNumber';
  }
  return null;
}

/**
 * Returns the current state of password requirement checks.
 */
export function getPasswordChecks(password: string): PasswordChecks {
  return {
    hasMinLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };
}
