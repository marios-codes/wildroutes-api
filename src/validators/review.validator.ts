import { z } from 'zod';
import { CreateReviewDto, GetReviewsQueryDto } from '../dtos/review.dto';
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

const getReviewsQuerySchema = z
  .object({
    page: z.coerce
      .number({ error: 'Page parameter should be of type number' })
      .int('Page parameter must be an integer')
      .min(1, 'Page parameter must be a positive value')
      .default(1),
    limit: z.coerce
      .number({ error: 'Limit parameter should be of type number' })
      .int('Limit parameter must be an integer')
      .min(1, 'Limit parameter must be a positive value')
      .max(100, 'Limit parameter cannot exceed 100')
      .default(10),
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

export const validateGetReviewsQuery = (reqQuery: unknown): GetReviewsQueryDto => {
  const validationResult = getReviewsQuerySchema.safeParse(reqQuery);

  if (!validationResult.success) {
    const message = validationResult.error.issues[0]?.message ?? 'Invalid review query params';
    throw new AppError(message, 400);
  }

  return validationResult.data;
};
