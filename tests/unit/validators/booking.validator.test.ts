import { describe, expect, it } from 'vitest';
import { validateGetBookingsQuery } from '../../../src/validators/booking.validator';

describe('validateGetBookingsQuery', () => {
  it('returns provided pagination fields for valid pagination query params', () => {
    expect(
      validateGetBookingsQuery({
        page: '2',
        limit: '5',
      }),
    ).toStrictEqual({
      page: 2,
      limit: 5,
    });
  });

  it('returns default pagination values when pagination query params are not provided', () => {
    expect(validateGetBookingsQuery({})).toStrictEqual({
      page: 1,
      limit: 10,
    });
  });

  it('throws when request params contain an unknown field', () => {
    expect(() => validateGetBookingsQuery({ sort: 'createdAt' })).toThrow(
      'Unrecognized key: "sort"',
    );
  });

  it('throws when limit request param is higher than 100', () => {
    expect(() => validateGetBookingsQuery({ limit: '101' })).toThrow(
      'Limit parameter cannot exceed 100',
    );
  });

  it('throws when page request param is not numeric', () => {
    expect(() => validateGetBookingsQuery({ page: 'abc' })).toThrow(
      'Page parameter should be of type number',
    );
  });

  it('throws when page request param is not a positive number', () => {
    expect(() => validateGetBookingsQuery({ page: '0' })).toThrow(
      'Page parameter must be a positive value',
    );
  });

  it('uses the default limit when only page is provided', () => {
    expect(validateGetBookingsQuery({ page: '2' })).toStrictEqual({
      page: 2,
      limit: 10,
    });
  });
});
