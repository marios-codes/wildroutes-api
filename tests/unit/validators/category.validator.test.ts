import { describe, it, expect } from 'vitest';
import {
  validateCreateCategoryBody,
  validateAssignCategoryToTourBody,
} from '../../../src/validators/category.validator';
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

const expectAssignCategoryToTourBadRequest = (reqBody: unknown): void => {
  try {
    validateAssignCategoryToTourBody(reqBody);
    expect.unreachable('Expected category assignment validation to throw');
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect(error).toMatchObject({ statusCode: 400 });
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
    expectBadRequest({ name: 'Hiking', duration: 3 }, 'Unrecognized key: "duration"');
  });
});

describe('validateAssignCategoryToTourBody', () => {
  it('returns a AssignCategoryToTourDto for a valid body', () => {
    expect(
      validateAssignCategoryToTourBody({
        categoryId: 1,
      }),
    ).toStrictEqual({
      categoryId: 1,
    });
  });

  it('throws when categoryId is zero', () => {
    expectAssignCategoryToTourBadRequest({ categoryId: 0 });
  });

  it('throws when categoryId is negative', () => {
    expectAssignCategoryToTourBadRequest({ categoryId: -1 });
  });

  it('throws when categoryId is not an integer', () => {
    expectAssignCategoryToTourBadRequest({ categoryId: 1.5 });
  });

  it('throws when categoryId is a string', () => {
    expectAssignCategoryToTourBadRequest({ categoryId: '1' });
  });

  it('throws when the body contains unexpected extra fields', () => {
    expectAssignCategoryToTourBadRequest({ categoryId: 1, unexpectedField: true });
  });
});
