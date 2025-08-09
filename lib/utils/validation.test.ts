import {
  isEmail,
  validateEmail,
  validatePassword,
  validateUsername,
  isUrl,
  validateUrl,
  isPhoneNumber,
  validatePhoneNumber,
  validateRequired,
  composeValidators,
  validateForm,
  ValidationErrors,
} from './validation';

describe('Validation Utilities', () => {
  // Email validation tests
  describe('isEmail', () => {
    it('validates correct email addresses', () => {
      expect(isEmail('user@example.com')).toBe(true);
      expect(isEmail('user.name@example.com')).toBe(true);
      expect(isEmail('user+tag@example.co.uk')).toBe(true);
      expect(isEmail('user_name@example-domain.com')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isEmail('notanemail')).toBe(false);
      expect(isEmail('missing@domain')).toBe(false);
      expect(isEmail('@example.com')).toBe(false);
      expect(isEmail('user@')).toBe(false);
      expect(isEmail('user name@example.com')).toBe(false);
      expect(isEmail('')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('returns null for valid emails', () => {
      expect(validateEmail('user@example.com')).toBe(null);
      expect(validateEmail('valid.email@domain.org')).toBe(null);
    });

    it('returns error for invalid emails', () => {
      expect(validateEmail('invalid')).toBe(ValidationErrors.EMAIL_INVALID);
      expect(validateEmail('@example.com')).toBe(ValidationErrors.EMAIL_INVALID);
    });

    it('returns required error for empty email', () => {
      expect(validateEmail('')).toBe(ValidationErrors.REQUIRED);
      expect(validateEmail('  ')).toBe(ValidationErrors.REQUIRED);
    });
  });

  // Password validation tests
  describe('validatePassword', () => {
    it('returns null for valid passwords', () => {
      expect(validatePassword('Password1!')).toBe(null);
      expect(validatePassword('Secure123@')).toBe(null);
      expect(validatePassword('MyP@ssw0rd')).toBe(null);
    });

    it('returns error for passwords too short', () => {
      expect(validatePassword('Pass1!')).toBe(ValidationErrors.PASSWORD_TOO_SHORT);
      expect(validatePassword('Ab1!')).toBe(ValidationErrors.PASSWORD_TOO_SHORT);
    });

    it('returns error for passwords without numbers', () => {
      expect(validatePassword('Password!')).toBe(ValidationErrors.PASSWORD_NO_NUMBER);
      expect(validatePassword('NoNumbers@')).toBe(ValidationErrors.PASSWORD_NO_NUMBER);
    });

    it('returns error for passwords without special characters', () => {
      expect(validatePassword('Password1')).toBe(ValidationErrors.PASSWORD_NO_SPECIAL);
      expect(validatePassword('NoSpecial123')).toBe(ValidationErrors.PASSWORD_NO_SPECIAL);
    });

    it('returns required error for empty password', () => {
      expect(validatePassword('')).toBe(ValidationErrors.REQUIRED);
      expect(validatePassword('  ')).toBe(ValidationErrors.REQUIRED);
    });
  });

  // Username validation tests
  describe('validateUsername', () => {
    it('returns null for valid usernames', () => {
      expect(validateUsername('user123')).toBe(null);
      expect(validateUsername('john_doe')).toBe(null);
      expect(validateUsername('User_Name_123')).toBe(null);
    });

    it('returns error for usernames too short', () => {
      expect(validateUsername('ab')).toBe(ValidationErrors.USERNAME_TOO_SHORT);
      expect(validateUsername('x')).toBe(ValidationErrors.USERNAME_TOO_SHORT);
    });

    it('returns error for usernames too long', () => {
      const longUsername = 'a'.repeat(21);
      expect(validateUsername(longUsername)).toBe(ValidationErrors.USERNAME_TOO_LONG);
    });

    it('returns error for usernames with invalid characters', () => {
      expect(validateUsername('user-name')).toBe(ValidationErrors.USERNAME_INVALID);
      expect(validateUsername('user@name')).toBe(ValidationErrors.USERNAME_INVALID);
      expect(validateUsername('user name')).toBe(ValidationErrors.USERNAME_INVALID);
      expect(validateUsername('user.name')).toBe(ValidationErrors.USERNAME_INVALID);
    });

    it('returns required error for empty username', () => {
      expect(validateUsername('')).toBe(ValidationErrors.REQUIRED);
      expect(validateUsername('  ')).toBe(ValidationErrors.REQUIRED);
    });
  });

  // URL validation tests
  describe('isUrl', () => {
    it('validates correct URLs', () => {
      expect(isUrl('https://example.com')).toBe(true);
      expect(isUrl('http://subdomain.example.com')).toBe(true);
      expect(isUrl('https://example.com/path/to/page')).toBe(true);
      expect(isUrl('https://example.com?query=param')).toBe(true);
      expect(isUrl('ftp://files.example.com')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(isUrl('not a url')).toBe(false);
      expect(isUrl('example.com')).toBe(false);
      expect(isUrl('//example.com')).toBe(false);
      expect(isUrl('')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('returns null for valid URLs', () => {
      expect(validateUrl('https://example.com')).toBe(null);
      expect(validateUrl('http://test.org')).toBe(null);
    });

    it('returns error for invalid URLs', () => {
      expect(validateUrl('invalid url')).toBe(ValidationErrors.URL_INVALID);
      expect(validateUrl('example.com')).toBe(ValidationErrors.URL_INVALID);
    });

    it('handles optional URLs correctly', () => {
      expect(validateUrl('', false)).toBe(null);
      expect(validateUrl('  ', false)).toBe(null);
    });

    it('handles required URLs correctly', () => {
      expect(validateUrl('', true)).toBe(ValidationErrors.REQUIRED);
      expect(validateUrl('  ', true)).toBe(ValidationErrors.REQUIRED);
    });
  });

  // Phone number validation tests
  describe('isPhoneNumber', () => {
    it('validates correct phone numbers', () => {
      expect(isPhoneNumber('123-456-7890')).toBe(true);
      expect(isPhoneNumber('(123) 456-7890')).toBe(true);
      expect(isPhoneNumber('123.456.7890')).toBe(true);
      expect(isPhoneNumber('1234567890')).toBe(true);
      expect(isPhoneNumber('+1234567890')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(isPhoneNumber('123')).toBe(false);
      expect(isPhoneNumber('abc-def-ghij')).toBe(false);
      expect(isPhoneNumber('12-34-5678')).toBe(false);
      expect(isPhoneNumber('')).toBe(false);
    });
  });

  describe('validatePhoneNumber', () => {
    it('returns null for valid phone numbers', () => {
      expect(validatePhoneNumber('123-456-7890')).toBe(null);
      expect(validatePhoneNumber('(123) 456-7890')).toBe(null);
    });

    it('returns error for invalid phone numbers', () => {
      expect(validatePhoneNumber('123')).toBe(ValidationErrors.PHONE_INVALID);
      expect(validatePhoneNumber('invalid')).toBe(ValidationErrors.PHONE_INVALID);
    });

    it('handles optional phone numbers correctly', () => {
      expect(validatePhoneNumber('', false)).toBe(null);
      expect(validatePhoneNumber('  ', false)).toBe(null);
    });

    it('handles required phone numbers correctly', () => {
      expect(validatePhoneNumber('', true)).toBe(ValidationErrors.REQUIRED);
      expect(validatePhoneNumber('  ', true)).toBe(ValidationErrors.REQUIRED);
    });
  });

  // Required field validation tests
  describe('validateRequired', () => {
    it('returns null for non-empty values', () => {
      expect(validateRequired('value')).toBe(null);
      expect(validateRequired(123)).toBe(null);
      expect(validateRequired(['item'])).toBe(null);
      expect(validateRequired({ key: 'value' })).toBe(null);
      expect(validateRequired(true)).toBe(null);
      expect(validateRequired(false)).toBe(null);
      expect(validateRequired(0)).toBe(null);
    });

    it('returns error for empty values', () => {
      expect(validateRequired(null)).toBe(ValidationErrors.REQUIRED);
      expect(validateRequired(undefined)).toBe(ValidationErrors.REQUIRED);
      expect(validateRequired('')).toBe(ValidationErrors.REQUIRED);
      expect(validateRequired('  ')).toBe(ValidationErrors.REQUIRED);
      expect(validateRequired([])).toBe(ValidationErrors.REQUIRED);
    });
  });

  // Validator composition tests
  describe('composeValidators', () => {
    it('runs multiple validators in order', () => {
      const validator = composeValidators(validateRequired, validateEmail);

      expect(validator('')).toBe(ValidationErrors.REQUIRED);
      expect(validator('invalid')).toBe(ValidationErrors.EMAIL_INVALID);
      expect(validator('valid@email.com')).toBe(null);
    });

    it('returns first error encountered', () => {
      const validator = composeValidators(
        validateRequired,
        (value) => (value.length < 5 ? 'Too short' : null),
        (value) => (value.length > 10 ? 'Too long' : null)
      );

      expect(validator('')).toBe(ValidationErrors.REQUIRED);
      expect(validator('abc')).toBe('Too short');
      expect(validator('verylongstring')).toBe('Too long');
      expect(validator('perfect')).toBe(null);
    });
  });

  // Form validation tests
  describe('validateForm', () => {
    it('validates all fields in a form', () => {
      const formData = {
        email: 'invalid-email',
        password: 'short',
        username: 'validuser',
      };

      const rules = {
        email: validateEmail,
        password: validatePassword,
        username: validateUsername,
      };

      const errors = validateForm(formData, rules);

      expect(errors.email).toBe(ValidationErrors.EMAIL_INVALID);
      expect(errors.password).toBe(ValidationErrors.PASSWORD_TOO_SHORT);
      expect(errors.username).toBeUndefined();
    });

    it('returns empty object for valid form', () => {
      const formData = {
        email: 'user@example.com',
        password: 'SecurePass1!',
        username: 'validuser',
      };

      const rules = {
        email: validateEmail,
        password: validatePassword,
        username: validateUsername,
      };

      const errors = validateForm(formData, rules);

      expect(errors).toEqual({});
    });

    it('handles partial validation rules', () => {
      const formData = {
        email: 'user@example.com',
        password: 'pass',
        username: 'user',
        bio: 'My bio',
      };

      const rules = {
        email: validateEmail,
        password: validatePassword,
      };

      const errors = validateForm(formData, rules);

      expect(errors.email).toBeUndefined();
      expect(errors.password).toBe(ValidationErrors.PASSWORD_TOO_SHORT);
      expect(errors.username).toBeUndefined();
      expect(errors.bio).toBeUndefined();
    });
  });
});
