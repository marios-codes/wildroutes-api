import {
  CreateTourDto,
  Difficulty,
  TOUR_DIFFICULTIES,
  TOUR_EDITABLE_FIELDS,
  UpdateTourDto,
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

export const validateUpdateTourBody = (reqBody: unknown): UpdateTourDto => {
  if (typeof reqBody !== 'object' || reqBody === null || Array.isArray(reqBody)) {
    throw new AppError('Request body must be an object', 400);
  }

  const updatedTourData: UpdateTourDto = {};
  const reqBodyObject = reqBody as Record<string, unknown>;

  // Reject empty body
  if (!reqBodyObject || Object.keys(reqBodyObject).length === 0) {
    throw new AppError('You must provide at least one tour field', 400);
  }

  // Reject unknown fields
  const requestFields = Object.keys(reqBodyObject);

  type AllowedField = (typeof TOUR_EDITABLE_FIELDS)[number];

  const invalidFields = requestFields.filter(
    (field) => !TOUR_EDITABLE_FIELDS.includes(field as AllowedField),
  );

  if (invalidFields.length > 0) {
    throw new AppError(`Invalid Fields: ${invalidFields.join(', ')}`, 400);
  }

  // Validate provided fields
  const name = reqBodyObject.name;
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length === 0) {
      throw new AppError('Tour name must be a non-empty string', 400);
    }

    updatedTourData.name = name;
  }

  const duration = reqBodyObject.duration;
  if (duration !== undefined) {
    if (typeof duration !== 'number' || !Number.isFinite(duration)) {
      throw new AppError('Tour duration should be of type number', 400);
    }

    if (!Number.isInteger(duration)) {
      throw new AppError('Tour duration must be an integer', 400);
    }

    if (duration <= 0) {
      throw new AppError('Tour duration must be a positive value', 400);
    }

    updatedTourData.duration = duration;
  }

  const numberOfParticipants = reqBodyObject.numberOfParticipants;
  if (numberOfParticipants !== undefined) {
    if (typeof numberOfParticipants !== 'number' || !Number.isFinite(numberOfParticipants)) {
      throw new AppError('Tour number of participants should be of type number', 400);
    }

    if (!Number.isInteger(numberOfParticipants)) {
      throw new AppError('Tour number of participants must be an integer', 400);
    }

    if (numberOfParticipants <= 0) {
      throw new AppError('Tour number of participants must be a positive value', 400);
    }

    updatedTourData.numberOfParticipants = numberOfParticipants;
  }

  const rating = reqBodyObject.rating;
  if (rating !== undefined) {
    if (typeof rating !== 'number' || !Number.isFinite(rating)) {
      throw new AppError('Tour rating should be of type number', 400);
    }

    if (rating <= 0 || rating > 5) {
      throw new AppError('Tour rating must be greater than 0 and less than or equal to 5', 400);
    }

    updatedTourData.rating = rating;
  }

  const difficulty = reqBodyObject.difficulty;
  if (difficulty !== undefined) {
    if (typeof difficulty !== 'string' || !TOUR_DIFFICULTIES.includes(difficulty as Difficulty)) {
      throw new AppError(`Tour difficulty must be one of: ${TOUR_DIFFICULTIES.join(', ')}`, 400);
    }

    const validatedDifficulty = difficulty as Difficulty;
    updatedTourData.difficulty = validatedDifficulty;
  }

  return updatedTourData;
};
