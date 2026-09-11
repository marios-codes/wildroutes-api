import { z } from 'zod';
import { CreateCategoryDto } from '../dtos/category.dto';
import { AppError } from '../utils/app-error';

const createCategorySchema = z
  .object({
    name: z.string().trim().min(1, 'Category name must be a non-empty string'),
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
