import { z } from 'zod';
import { CreateCategoryDto, AssignCategoryToTourDto } from '../dtos/category.dto';
import { AppError } from '../utils/app-error';

const CATEGORY_NAME_MAX_LENGTH = 50;

const createCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Category name must be a non-empty string')
      .max(
        CATEGORY_NAME_MAX_LENGTH,
        `Category name cannot exceed ${CATEGORY_NAME_MAX_LENGTH} characters`,
      ),
  })
  .strict();

export const validateCreateCategoryBody = (reqBody: unknown): CreateCategoryDto => {
  const validationResult = createCategorySchema.safeParse(reqBody);

  if (!validationResult.success) {
    const message = validationResult.error.issues[0]?.message ?? 'Invalid category data';
    throw new AppError(message, 400);
  }

  return validationResult.data;
};

const assignCategoryToTourSchema = z
  .object({
    categoryId: z.number().positive().int('categoryId must be a positive integer number'),
  })
  .strict();

export const validateAssignCategoryToTourBody = (reqBody: unknown): AssignCategoryToTourDto => {
  const validationResult = assignCategoryToTourSchema.safeParse(reqBody);

  if (!validationResult.success) {
    const message = validationResult.error.issues[0]?.message ?? 'Invalid category data';
    throw new AppError(message, 400);
  }

  return validationResult.data;
};
