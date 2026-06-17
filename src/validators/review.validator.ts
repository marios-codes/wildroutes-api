import { z } from 'zod';
import { CreateReviewDto } from '../dtos/review.dto';
import { AppError } from '../utils/app-error';

const createReviewSchema = z
  .object({
    rating: z
      .number({ error: 'Review rating should be of type number' })
      .int('Review rating must be an integer')
      .min(1, 'Review rating must be a positive value')
      .max(5, 'Review rating cannot exceed 5'),
    comment: z.string().trim().min(1, 'Review comment must be a non-empty string'),
  })
  .strict();

export const validateCreateReviewBody = (reqBody: unknown): CreateReviewDto => {
  const validationResult = createReviewSchema.safeParse(reqBody);

  if (!validationResult.success) {
    const message = validationResult.error.issues[0]?.message ?? 'Invalid review data';
    throw new AppError(message, 400);
  }

  return validationResult.data;
};
