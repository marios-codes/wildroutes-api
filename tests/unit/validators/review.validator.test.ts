import { describe, it, expect } from 'vitest';
import { validateCreateReviewBody } from '../../../src/validators/review.validator';

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
