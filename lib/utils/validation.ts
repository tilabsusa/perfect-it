export const ValidationErrors = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_NO_NUMBER: 'Password must contain at least one number',
  PASSWORD_NO_SPECIAL: 'Password must contain at least one special character',
  USERNAME_TOO_SHORT: 'Username must be at least 3 characters',
  USERNAME_TOO_LONG: 'Username must be no more than 20 characters',
  USERNAME_INVALID: 'Username can only contain letters, numbers, and underscores',
  URL_INVALID: 'Please enter a valid URL',
  PHONE_INVALID: 'Please enter a valid phone number',
} as const;

export const isEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateEmail = (email: string): string | null => {
  if (!email || email.trim() === '') {
    return ValidationErrors.REQUIRED;
  }
  if (!isEmail(email)) {
    return ValidationErrors.EMAIL_INVALID;
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password || password.trim() === '') {
    return ValidationErrors.REQUIRED;
  }
  if (password.length < 8) {
    return ValidationErrors.PASSWORD_TOO_SHORT;
  }
  if (!/\d/.test(password)) {
    return ValidationErrors.PASSWORD_NO_NUMBER;
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return ValidationErrors.PASSWORD_NO_SPECIAL;
  }
  return null;
};

export const validateUsername = (username: string): string | null => {
  if (!username || username.trim() === '') {
    return ValidationErrors.REQUIRED;
  }
  if (username.length < 3) {
    return ValidationErrors.USERNAME_TOO_SHORT;
  }
  if (username.length > 20) {
    return ValidationErrors.USERNAME_TOO_LONG;
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return ValidationErrors.USERNAME_INVALID;
  }
  return null;
};

export const isUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateUrl = (url: string, required: boolean = false): string | null => {
  if (!url || url.trim() === '') {
    return required ? ValidationErrors.REQUIRED : null;
  }
  if (!isUrl(url)) {
    return ValidationErrors.URL_INVALID;
  }
  return null;
};

export const isPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePhoneNumber = (phone: string, required: boolean = false): string | null => {
  if (!phone || phone.trim() === '') {
    return required ? ValidationErrors.REQUIRED : null;
  }
  if (!isPhoneNumber(phone)) {
    return ValidationErrors.PHONE_INVALID;
  }
  return null;
};

export const validateRequired = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return ValidationErrors.REQUIRED;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return ValidationErrors.REQUIRED;
  }
  if (Array.isArray(value) && value.length === 0) {
    return ValidationErrors.REQUIRED;
  }
  return null;
};

export interface ValidationRule {
  validate: (value: unknown) => string | null;
  message?: string;
}

export const composeValidators = (...validators: Array<(value: unknown) => string | null>) => {
  return (value: unknown): string | null => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        return error;
      }
    }
    return null;
  };
};

export const validateForm = <T extends Record<string, unknown>>(
  values: T,
  rules: Partial<Record<keyof T, (value: unknown) => string | null>>
): Partial<Record<keyof T, string>> => {
  const errors: Partial<Record<keyof T, string>> = {};

  for (const [field, validator] of Object.entries(rules) as Array<
    [keyof T, (value: unknown) => string | null]
  >) {
    const error = validator(values[field]);
    if (error) {
      errors[field] = error;
    }
  }

  return errors;
};
