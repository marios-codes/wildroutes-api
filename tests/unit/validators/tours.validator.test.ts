import { describe, it, expect } from 'vitest';
import {
  validateCreateTourBody,
  validateUpdateTourBody,
  validateGetToursQuery,
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
  it('trims whitespace from tour name', () => {
    expect(
      validateCreateTourBody({
        name: '  Forest Canyon Trail  ',
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
  it('throws when create body contains an unknown field', () => {
    expect(() =>
      validateCreateTourBody({
        name: 'Forest Canyon Trail',
        duration: 3,
        difficulty: 'EASY',
        rating: 4.6,
        numberOfParticipants: 12,
        price: 100,
      }),
    ).toThrow();
  });

  it('throws when request body is not an object', () => {
    expect(() => validateCreateTourBody(null)).toThrow();
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
    expect(() => validateUpdateTourBody({ price: 100 })).toThrow('Unrecognized key: "price"');
  });
});

describe('validateGetToursQuery', () => {
  it('returns provided pagination fields for valid pagination query params', () => {
    expect(
      validateGetToursQuery({
        page: '2',
        limit: '5',
      }),
    ).toStrictEqual({
      page: 2,
      limit: 5,
    });
  });
  it('returns default pagination values when pagination query params are not provided', () => {
    expect(validateGetToursQuery({})).toStrictEqual({
      page: 1,
      limit: 10,
    });
  });
  it('throws when request params contain an unknown field', () => {
    expect(() => validateGetToursQuery({ price: '100' })).toThrow('Unrecognized key: "price"');
  });
  it('throws when limit request param is higher than 100', () => {
    expect(() => validateGetToursQuery({ limit: '150' })).toThrow(
      'Limit parameter cannot exceed 100',
    );
  });
  it('throws when page request param is not numeric', () => {
    expect(() => validateGetToursQuery({ page: 'abc' })).toThrow(
      'Page parameter should be of type number',
    );
  });
  it('throws when page request param is not a positive number', () => {
    expect(() => validateGetToursQuery({ page: '0' })).toThrow(
      'Page parameter must be a positive value',
    );
  });
  it('uses the default limit when only page is provided', () => {
    expect(validateGetToursQuery({ page: '2' })).toStrictEqual({
      page: 2,
      limit: 10,
    });
  });
});
