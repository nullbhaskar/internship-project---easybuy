/**
 * Validation utility functions used across forms in the EasyBuy app.
 * Covers email, phone, pincode, name, and password validation.
 */

/** Returns true if the string is a valid Indian mobile number. */
export function isValidPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone.trim());
}

/** Returns true if the string is a valid email address. */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim().toLowerCase());
}

/** Returns true if the string is a valid 6-digit Indian pincode. */
export function isValidPincode(pin: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pin.trim());
}

/** Returns true if the name has at least 2 characters and no numbers. */
export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && !/\d/.test(name);
}

/**
 * Validates a password and returns an error message or null if valid.
 * Requirements: min 8 characters, at least 1 number, 1 uppercase letter.
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
  return null;
}

/**
 * Returns true if two password fields match.
 */
export function passwordsMatch(password: string, confirm: string): boolean {
  return password === confirm;
}
