import {
  timestampToDate,
  timestampToDateWithoutTime,
  isPastDate,
  getFirstLetters,
  isValidString,
  isValidEmail,
  isValidDate,
  isValidStringNumber,
  isValidPhone,
  isValidNumber,
  saveBlobAs,
  getDownloadRegistrationsContent,
} from './utils';
import { Registration } from './types';

describe('utils', () => {
  describe('timestampToDate', () => {
    it('should format timestamp correctly', () => {
      const timestamp = new Date(2024, 0, 15, 14, 30).getTime();
      const result = timestampToDate(timestamp);
      expect(result).toBe('15.1.2024 14:30');
    });

    it('should handle single digit minutes with padding', () => {
      const timestamp = new Date(2024, 0, 15, 14, 5).getTime();
      const result = timestampToDate(timestamp);
      expect(result).toBe('15.1.2024 14:05');
    });
  });

  describe('timestampToDateWithoutTime', () => {
    it('should format date without time', () => {
      const timestamp = new Date(2024, 0, 15, 14, 30).getTime();
      const result = timestampToDateWithoutTime(timestamp);
      expect(result).toBe('15.1.2024');
    });
  });

  describe('isPastDate', () => {
    it('should return true for past dates', () => {
      const pastDate = new Date(2020, 0, 1).getTime();
      expect(isPastDate(pastDate)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date(2030, 0, 1).getTime();
      expect(isPastDate(futureDate)).toBe(false);
    });
  });

  describe('getFirstLetters', () => {
    it('should extract first letters from each word', () => {
      expect(getFirstLetters('John Doe')).toBe('JD');
      expect(getFirstLetters('Alpha Beta Gamma')).toBe('ABG');
    });

    it('should handle single word', () => {
      expect(getFirstLetters('Single')).toBe('S');
    });

    it('should handle empty string', () => {
      expect(getFirstLetters('')).toBe('');
    });
  });

  describe('isValidString', () => {
    it('should return true for valid strings', () => {
      expect(isValidString('test')).toBe(true);
      expect(isValidString(' ')).toBe(true);
    });

    it('should return false for invalid strings', () => {
      expect(isValidString('')).toBe(false);
      expect(isValidString(undefined)).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('a@b')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('should validate defined dates', () => {
      expect(isValidDate(123456789)).toBe(true);
      expect(isValidDate(0)).toBe(true);
    });

    it('should reject undefined', () => {
      expect(isValidDate(undefined)).toBe(false);
    });
  });

  describe('isValidStringNumber', () => {
    it('should validate string numbers', () => {
      expect(isValidStringNumber('123')).toBe(true);
      expect(isValidStringNumber('0')).toBe(true);
    });

    it('should reject non-numeric strings', () => {
      expect(isValidStringNumber('abc')).toBe(false);
      expect(isValidStringNumber('12a')).toBe(false);
      expect(isValidStringNumber('')).toBe(false);
      expect(isValidStringNumber(undefined)).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate phone numbers', () => {
      expect(isValidPhone('123456789')).toBe(true);
      expect(isValidPhone('+420123456789')).toBe(true);
    });

    it('should reject invalid phone formats', () => {
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('123-456')).toBe(false);
      expect(isValidPhone('')).toBe(false);
      expect(isValidPhone(undefined)).toBe(false);
    });
  });

  describe('isValidNumber', () => {
    it('should validate numbers above minimum', () => {
      expect(isValidNumber(10, 5)).toBe(true);
      expect(isValidNumber(5, 5)).toBe(true);
      expect(isValidNumber('10', 5)).toBe(true);
    });

    it('should reject numbers below minimum', () => {
      expect(isValidNumber(4, 5)).toBe(false);
      expect(isValidNumber('4', 5)).toBe(false);
    });

    it('should reject invalid values', () => {
      expect(isValidNumber(undefined, 5)).toBe(false);
      expect(isValidNumber('abc', 5)).toBe(false);
      expect(isValidNumber('0', 5)).toBe(false);
    });
  });

  describe('saveBlobAs', () => {
    it('should create and click download link', () => {
      const mockClick = jest.fn();
      const mockCreateElement = jest.spyOn(document, 'createElement');

      mockCreateElement.mockReturnValue({
        click: mockClick,
        download: '',
        href: '',
        target: '',
      } as any);

      saveBlobAs(['test content'], 'test.txt');

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockClick).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
    });
  });

  describe('getDownloadRegistrationsContent', () => {
    it('should format registrations as CSV', () => {
      const mockRegistrations: Registration[] = [
        {
          id: 1,
          name: 'John',
          last_name: 'Doe',
          registration_type_name: 'Standard',
          club: 'Club A',
          price: 100,
          is_leader: true,
          paid: true,
          date_of_birth: new Date(1990, 0, 1).getTime(),
          phone: '123456789',
          sex: 'M',
          address: '123 Main St',
          email: 'john@example.com',
        } as Registration,
      ];

      const result = getDownloadRegistrationsContent(mockRegistrations);

      expect(result).toContain('John');
      expect(result).toContain('Doe');
      expect(result).toContain('Standard');
      expect(result).toContain('Club A');
    });

    it('should handle semicolons in data', () => {
      const mockRegistrations: Registration[] = [
        {
          id: 1,
          name: 'John;Test',
          last_name: 'Doe;Test',
          email: 'test@example.com',
        } as Registration,
      ];

      const result = getDownloadRegistrationsContent(mockRegistrations);

      expect(result).toContain('JohnTest');
      expect(result).toContain('DoeTest');
      expect(result).not.toContain('John;Test');
    });
  });
});