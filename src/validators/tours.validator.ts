import { z } from 'zod';
import { CreateTourDto, TOUR_DIFFICULTIES, UpdateTourDto } from '../dtos/tours.dto';
import { AppError } from '../utils/app-error';

const createTourSchema = z
  .object({
    name: z.string().trim().min(1, 'Tour name must be a non-empty string'),
    duration: z
      .number({ error: 'Tour duration should be of type number' })
      .int('Tour duration must be an integer')
      .min(1, 'Tour duration must be a positive value'),
    difficulty: z.enum(
      TOUR_DIFFICULTIES,
      `Tour difficulty must be one of: ${TOUR_DIFFICULTIES.join(', ')}`,
    ),
    rating: z
      .number({ error: 'Tour rating should be of type number' })
      .refine(
        (rating) => rating > 0 && rating <= 5,
        'Tour rating must be greater than 0 and less than or equal to 5',
      ),
    numberOfParticipants: z
      .number({ error: 'Tour number of participants should be of type number' })
      .int('Tour number of participants must be an integer')
      .min(1, 'Tour number of participants must be a positive value'),
  })
  .strict();

const updateTourSchema = createTourSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, 'You must provide at least one tour field');

export const validateCreateTourBody = (reqBody: unknown): CreateTourDto => {
  const validationResult = createTourSchema.safeParse(reqBody);

  if (!validationResult.success) {
    const message = validationResult.error.issues[0]?.message ?? 'Invalid tour data';
    throw new AppError(message, 400);
  }

  return validationResult.data;
};

export const validateUpdateTourBody = (reqBody: unknown): UpdateTourDto => {
  const validationResult = updateTourSchema.safeParse(reqBody);

  if (!validationResult.success) {
    const message = validationResult.error.issues[0]?.message ?? 'Invalid tour data';
    throw new AppError(message, 400);
  }

  return validationResult.data;
};
