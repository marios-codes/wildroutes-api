import { describe, it, expect } from 'vitest';
import parseId from '../../../src/utils/parse-id';

describe('parseId', () => {
  it('returns a number for a valid positive integer string', () => {
    expect(parseId('12')).toBe(12);
  });
  it('throws when id is not an integer', () => {
    expect(() => parseId('1.5')).toThrow('ID must be a positive integer');
  });
});
