import { describe, it, expect } from 'vitest';
import {
  validateCreateReviewBody,
  validateGetReviewsQuery,
  validateUpdateReviewBody,
} from '../../../src/validators/review.validator';

describe('validateCreateReviewBody', () => {
  it('returns a CreateReviewDto for a valid body', () => {
    expect(
      validateCreateReviewBody({
        rating: 4,
        comment: 'Very nice tour!',
      }),
    ).toStrictEqual({
      rating: 4,
      comment: 'Very nice tour!',
    });
  });
  it('throws when rating is empty', () => {
    expect(() =>
      validateCreateReviewBody({
        comment: 'Very nice tour!',
      }),
    ).toThrow();
  });
  it('throws when rating is not a number', () => {
    expect(() =>
      validateCreateReviewBody({
        rating: '4',
        comment: 'Very nice tour!',
      }),
    ).toThrow('Review rating should be of type number');
  });
  it('throws when rating is below 1', () => {
    expect(() =>
      validateCreateReviewBody({
        rating: 0,
        comment: 'Very nice tour!',
      }),
    ).toThrow('Review rating must be a positive value');
  });
  it('throws when rating is above 5', () => {
    expect(() =>
      validateCreateReviewBody({
        rating: 7,
        comment: 'Very nice tour!',
      }),
    ).toThrow('Review rating cannot exceed 5');
  });
  it('throws when non-integer rating is provided', () => {
    expect(() =>
      validateCreateReviewBody({
        rating: 4.5,
        comment: 'Very nice tour!',
      }),
    ).toThrow('Review rating must be an integer');
  });
  it('throws when missing comment', () => {
    expect(() =>
      validateCreateReviewBody({
        rating: 4,
      }),
    ).toThrow();
  });
  it('throws when empty comment', () => {
    expect(() =>
      validateCreateReviewBody({
        rating: 4,
        comment: ' ',
      }),
    ).toThrow('Review comment must be a non-empty string');
  });
  it('throws when extra fields are provided', () => {
    expect(() =>
      validateCreateReviewBody({
        rating: 4,
        comment: 'Very nice tour!',
        userId: 1,
      }),
    ).toThrow();
  });
});

describe('validateUpdateReviewBody', () => {
  it('returns rating when only rating is provided', () => {
    expect(
      validateUpdateReviewBody({
        rating: 4,
      }),
    ).toStrictEqual({
      rating: 4,
    });
  });
  it('returns comment when only comment is provided', () => {
    expect(
      validateUpdateReviewBody({
        comment: 'Updated comment',
      }),
    ).toStrictEqual({
      comment: 'Updated comment',
    });
  });
  it('returns rating and comment when both are provided', () => {
    expect(
      validateUpdateReviewBody({
        rating: 4,
        comment: 'Updated comment',
      }),
    ).toStrictEqual({
      rating: 4,
      comment: 'Updated comment',
    });
  });
  it('throws when request body is empty', () => {
    expect(() => validateUpdateReviewBody({})).toThrow(
      'You must provide at least one review field',
    );
  });
  it('throws when invalid rating', () => {
    expect(() => validateUpdateReviewBody({ rating: 8 })).toThrow('Review rating cannot exceed 5');
  });
  it('throws when empty comment', () => {
    expect(() => validateUpdateReviewBody({ comment: '' })).toThrow(
      'Review comment must be a non-empty string',
    );
  });
  it('throws when request body contains an unknown field', () => {
    expect(() => validateUpdateReviewBody({ userId: 1 })).toThrow('Unrecognized key: "userId"');
  });
});

describe('validateGetReviewsQuery', () => {
  it('returns provided pagination fields for valid pagination query params', () => {
    expect(
      validateGetReviewsQuery({
        page: '2',
        limit: '5',
      }),
    ).toStrictEqual({
      page: 2,
      limit: 5,
    });
  });
  it('returns default pagination values when pagination query params are not provided', () => {
    expect(validateGetReviewsQuery({})).toStrictEqual({
      page: 1,
      limit: 10,
    });
  });
  it('throws when request params contain an unknown field', () => {
    expect(() => validateGetReviewsQuery({ rating: '5' })).toThrow('Unrecognized key: "rating"');
  });
  it('throws when limit request param is higher than 100', () => {
    expect(() => validateGetReviewsQuery({ limit: '150' })).toThrow(
      'Limit parameter cannot exceed 100',
    );
  });
  it('throws when page request param is not numeric', () => {
    expect(() => validateGetReviewsQuery({ page: 'abc' })).toThrow(
      'Page parameter should be of type number',
    );
  });
  it('throws when page request param is not a positive number', () => {
    expect(() => validateGetReviewsQuery({ page: '0' })).toThrow(
      'Page parameter must be a positive value',
    );
  });
  it('uses the default limit when only page is provided', () => {
    expect(validateGetReviewsQuery({ page: '2' })).toStrictEqual({
      page: 2,
      limit: 10,
    });
  });
});
