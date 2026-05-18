import { describe, it, expect } from 'vitest';
import {
  validateCreateTourBody,
  validateUpdateTourBody,
} from '../../../src/validators/tours.validator';

describe('validateCreateTourBody', () => {
  it('returns a CreateTourDto for a valid body', () => {
    expect(
      validateCreateTourBody({
        name: 'Forest Canyon Trail',
        duration: 3,
        difficulty: 'EASY',
        rating: 4.6,
        numberOfParticipants: 12,
      }),
    ).toStrictEqual({
      name: 'Forest Canyon Trail',
      duration: 3,
      difficulty: 'EASY',
      rating: 4.6,
      numberOfParticipants: 12,
    });
  });
  it('throws when name is an empty string', () => {
    expect(() =>
      validateCreateTourBody({
        name: '',
        duration: 3,
        difficulty: 'EASY',
        rating: 4.6,
        numberOfParticipants: 12,
      }),
    ).toThrow('Tour name must be a non-empty string');
  });
  it('throws when request body is not an object', () => {
    expect(() => validateCreateTourBody(null)).toThrow('Request body must be an object');
  });
});

describe('validateUpdateTourBody', () => {
  it('returns only provided fields for a valid partial update body', () => {
    expect(
      validateUpdateTourBody({
        name: 'Updated Forest Trail',
      }),
    ).toStrictEqual({
      name: 'Updated Forest Trail',
    });
  });
  it('throws when request body is empty', () => {
    expect(() => validateUpdateTourBody({})).toThrow('You must provide at least one tour field');
  });
  it('throws when request body contains an unknown field', () => {
    expect(() => validateUpdateTourBody({ price: 100 })).toThrow('Invalid Fields: price');
  });
});
