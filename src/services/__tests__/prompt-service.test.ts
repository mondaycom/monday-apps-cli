import { validateIfValueIsANumber } from '../prompt-service';

describe('validateIfValueIsANumber', () => {
  const errorMessage = 'Please enter a valid number';

  describe('when field is not required', () => {
    it('should accept empty string', () => {
      expect(validateIfValueIsANumber('', errorMessage, false)).toBe(true);
    });

    it('should accept zero', () => {
      expect(validateIfValueIsANumber('0', errorMessage, false)).toBe(true);
    });

    it('should accept positive integers', () => {
      expect(validateIfValueIsANumber('1', errorMessage, false)).toBe(true);
      expect(validateIfValueIsANumber('123', errorMessage, false)).toBe(true);
    });

    it('should reject negative numbers', () => {
      expect(validateIfValueIsANumber('-1', errorMessage, false)).toBe(errorMessage);
      expect(validateIfValueIsANumber('-123', errorMessage, false)).toBe(errorMessage);
    });

    it('should reject decimal numbers', () => {
      expect(validateIfValueIsANumber('1.5', errorMessage, false)).toBe(errorMessage);
      expect(validateIfValueIsANumber('0.5', errorMessage, false)).toBe(errorMessage);
    });

    it('should reject non-numeric strings', () => {
      expect(validateIfValueIsANumber('abc', errorMessage, false)).toBe(errorMessage);
      expect(validateIfValueIsANumber('1a', errorMessage, false)).toBe(errorMessage);
      expect(validateIfValueIsANumber('a1', errorMessage, false)).toBe(errorMessage);
    });

    it('should reject invalid formats', () => {
      expect(validateIfValueIsANumber('1.', errorMessage, false)).toBe(errorMessage);
      expect(validateIfValueIsANumber('.1', errorMessage, false)).toBe(errorMessage);
      expect(validateIfValueIsANumber('1..1', errorMessage, false)).toBe(errorMessage);
    });
  });

  describe('when field is required', () => {
    it('should reject empty string', () => {
      expect(validateIfValueIsANumber('', errorMessage, true)).toBe(errorMessage);
    });

    it('should accept zero', () => {
      expect(validateIfValueIsANumber('0', errorMessage, true)).toBe(true);
    });

    it('should accept positive integers', () => {
      expect(validateIfValueIsANumber('1', errorMessage, true)).toBe(true);
      expect(validateIfValueIsANumber('123', errorMessage, true)).toBe(true);
    });

    it('should reject negative numbers', () => {
      expect(validateIfValueIsANumber('-1', errorMessage, true)).toBe(errorMessage);
      expect(validateIfValueIsANumber('-123', errorMessage, true)).toBe(errorMessage);
    });

    it('should reject decimal numbers', () => {
      expect(validateIfValueIsANumber('1.5', errorMessage, true)).toBe(errorMessage);
      expect(validateIfValueIsANumber('0.5', errorMessage, true)).toBe(errorMessage);
    });

    it('should reject non-numeric strings', () => {
      expect(validateIfValueIsANumber('abc', errorMessage, true)).toBe(errorMessage);
      expect(validateIfValueIsANumber('1a', errorMessage, true)).toBe(errorMessage);
      expect(validateIfValueIsANumber('a1', errorMessage, true)).toBe(errorMessage);
    });

    it('should reject invalid formats', () => {
      expect(validateIfValueIsANumber('1.', errorMessage, true)).toBe(errorMessage);
      expect(validateIfValueIsANumber('.1', errorMessage, true)).toBe(errorMessage);
      expect(validateIfValueIsANumber('1..1', errorMessage, true)).toBe(errorMessage);
    });
  });
});
