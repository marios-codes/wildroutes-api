import {
  CreateTourDto,
  Difficulty,
  TOUR_DIFFICULTIES,
  TOUR_EDITABLE_FIELDS,
} from '../dtos/tours.dto';
import { AppError } from '../utils/app-error';

export const validateCreateTourBody = (reqBody: unknown): CreateTourDto => {
  if (typeof reqBody !== 'object' || reqBody === null || Array.isArray(reqBody)) {
    throw new AppError('Request body must be an object', 400);
  }

  const objectReqBody = reqBody as Record<string, unknown>;

  for (const field of TOUR_EDITABLE_FIELDS) {
    if (objectReqBody[field] === undefined) {
      throw new AppError(`Tour ${field} is required`, 400);
    }
  }

  const name = objectReqBody.name;
  const duration = objectReqBody.duration;
  const difficulty = objectReqBody.difficulty;
  const rating = objectReqBody.rating;
  const numberOfParticipants = objectReqBody.numberOfParticipants;

  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new AppError('Tour name must be a non-empty string', 400);
  }

  if (typeof duration !== 'number' || !Number.isFinite(duration)) {
    throw new AppError('Tour duration should be of type number', 400);
  }

  if (!Number.isInteger(duration)) {
    throw new AppError('Tour duration must be an integer', 400);
  }

  if (duration <= 0) {
    throw new AppError('Tour duration must be a positive value', 400);
  }

  if (typeof numberOfParticipants !== 'number' || !Number.isFinite(numberOfParticipants)) {
    throw new AppError('Tour number of participants should be of type number', 400);
  }

  if (!Number.isInteger(numberOfParticipants)) {
    throw new AppError('Tour number of participants must be an integer', 400);
  }

  if (numberOfParticipants <= 0) {
    throw new AppError('Tour number of participants must be a positive value', 400);
  }

  if (typeof rating !== 'number' || !Number.isFinite(rating)) {
    throw new AppError('Tour rating should be of type number', 400);
  }

  if (rating <= 0 || rating > 5) {
    throw new AppError('Tour rating must be greater than 0 and less than or equal to 5', 400);
  }

  if (typeof difficulty !== 'string' || !TOUR_DIFFICULTIES.includes(difficulty as Difficulty)) {
    throw new AppError(`Tour difficulty must be one of: ${TOUR_DIFFICULTIES.join(', ')}`, 400);
  }

  const validatedDifficulty = difficulty as Difficulty;

  const newTourData: CreateTourDto = {
    name,
    duration,
    difficulty: validatedDifficulty,
    rating,
    numberOfParticipants,
  };

  return newTourData;
};
