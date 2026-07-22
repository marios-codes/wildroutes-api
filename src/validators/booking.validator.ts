import { z } from 'zod';
import type { GetBookingsQueryDto } from '../dtos/booking.dto';
import { AppError } from '../utils/app-error';

const getBookingsQuerySchema = z
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

export const validateGetBookingsQuery = (reqQuery: unknown): GetBookingsQueryDto => {
  const validationResult = getBookingsQuerySchema.safeParse(reqQuery);

  if (!validationResult.success) {
    const message = validationResult.error.issues[0]?.message ?? 'Invalid booking query params';
    throw new AppError(message, 400);
  }

  return validationResult.data;
};
