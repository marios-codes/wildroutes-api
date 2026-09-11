import { describe, it, expect } from 'vitest';
import { validateCreateCategoryBody } from '../../../src/validators/category.validator';
import { AppError } from '../../../src/utils/app-error';

const expectBadRequest = (reqBody: unknown, expectedMessage: string): void => {
  try {
    validateCreateCategoryBody(reqBody);
    expect.unreachable('Expected category validation to throw');
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({
      message: expectedMessage,
      statusCode: 400,
    });
  }
};

describe('validateCreateCategoryBody', () => {
  it('returns a CreateCategoryDto for a valid body', () => {
    expect(
      validateCreateCategoryBody({
        name: 'Hiking',
      }),
    ).toStrictEqual({
      name: 'Hiking',
    });
  });

  it('trims whitespace from the category name', () => {
    expect(
      validateCreateCategoryBody({
        name: ' Hiking ',
      }),
    ).toStrictEqual({
      name: 'Hiking',
    });
  });

  it('throws when name is an empty string', () => {
    expectBadRequest({ name: '' }, 'Category name must be a non-empty string');
  });

  it('throws when name contains only whitespace', () => {
    expectBadRequest({ name: '   ' }, 'Category name must be a non-empty string');
  });

  it('throws when name is missing', () => {
    expectBadRequest({}, 'Invalid input: expected string, received undefined');
  });

  it('throws when the body contains unexpected extra fields', () => {
    expectBadRequest(
      { name: 'Hiking', duration: 3 },
      'Unrecognized key: "duration"',
    );
  });
});
