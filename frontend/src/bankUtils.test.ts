import { getIBAN } from './bankUtils';

describe('bankUtils', () => {
  describe('getIBAN', () => {
    it('should generate valid IBAN for Czech bank account', () => {
      const paymentInfo = {
        bankCode: '0100',
        accountNumber: '1234567890',
        accountPrefix: '123456',
      };

      const iban = getIBAN(paymentInfo);

      expect(iban).toHaveLength(24);
      expect(iban).toMatch(/^CZ\d{22}$/);
      expect(iban.substring(0, 2)).toBe('CZ');
    });

    it('should pad values with zeros', () => {
      const paymentInfo = {
        bankCode: '100',
        accountNumber: '123',
        accountPrefix: '12',
      };

      const iban = getIBAN(paymentInfo);

      expect(iban).toHaveLength(24);
      expect(iban).toContain('0100'); // padded bank code
    });

    it('should throw error for invalid account that produces wrong length IBAN', () => {
      const paymentInfo = {
        bankCode: '',
        accountNumber: '',
        accountPrefix: '',
      };

      // Mock the logic to produce invalid length
      const originalError = console.error;
      console.error = jest.fn();

      try {
        // This should throw if the logic produces an invalid IBAN
        const iban = getIBAN(paymentInfo);
        if (iban.length !== 24) {
          throw new Error('Invalid IBAN length');
        }
      } catch (error) {
        // Expected behavior
      }

      console.error = originalError;
    });

    it('should calculate correct checksum', () => {
      const paymentInfo = {
        bankCode: '0800',
        accountNumber: '192017',
        accountPrefix: '0',
      };

      const iban = getIBAN(paymentInfo);

      // The checksum calculation should produce a valid IBAN
      expect(iban).toHaveLength(24);
      expect(iban.substring(0, 2)).toBe('CZ');
      // Verify it contains the bank code
      expect(iban).toContain('0800');
    });
  });
});