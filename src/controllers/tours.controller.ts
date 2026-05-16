import { Request, Response } from 'express';
import { getTours, getTour, createTour, updateTour, deleteTour } from '../services/tours.service';
import type { UpdateTourDto, Difficulty } from '../dtos/tours.dto';
import { TOUR_DIFFICULTIES, TOUR_EDITABLE_FIELDS } from '../dtos/tours.dto';
import { AppError } from '../utils/app-error';
import parseId from '../utils/parse-id';
import { validateCreateTourBody } from '../validators/tours.validator';

export const getToursHandler = async (_req: Request, res: Response) => {
  const tours = await getTours();

  res.status(200).json({
    success: true,
    count: tours.length,
    data: {
      tours,
    },
  });
};

export const getTourHandler = async (req: Request, res: Response) => {
  const tourId = parseId(req.params.id);

  const tour = await getTour(tourId);

  res.status(200).json({
    success: true,
    data: {
      tour,
    },
  });
};

export const createTourHandler = async (req: Request, res: Response) => {
  const newTourData = validateCreateTourBody(req.body);

  const tour = await createTour(newTourData);

  res.status(201).json({
    success: true,
    data: {
      tour,
    },
  });
};

export const updateTourHandler = async (req: Request, res: Response) => {
  const tourId = parseId(req.params.id);

  // Reject empty body
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new AppError('You must provide at least one tour field', 400);
  }

  // Reject unknown fields

  const requestFields = Object.keys(req.body);

  type AllowedField = (typeof TOUR_EDITABLE_FIELDS)[number];

  const invalidFields = requestFields.filter(
    (field) => !TOUR_EDITABLE_FIELDS.includes(field as AllowedField),
  );

  if (invalidFields.length > 0) {
    throw new AppError(`Invalid Fields: ${invalidFields.join(', ')}`, 400);
  }

  // Validate provided fields
  if (
    req.body.name !== undefined &&
    (typeof req.body.name !== 'string' || req.body.name.trim().length === 0)
  ) {
    throw new AppError('Tour name must be a non-empty string', 400);
  }

  const numberFields = ['duration', 'numberOfParticipants', 'rating'] as const;

  for (const field of numberFields) {
    if (
      req.body[field] !== undefined &&
      (typeof req.body[field] !== 'number' || !Number.isFinite(req.body[field]))
    ) {
      throw new AppError(`Tour ${field} should be of type number`, 400);
    }
  }

  if (req.body.duration !== undefined && !Number.isInteger(req.body.duration)) {
    throw new AppError('Tour duration must be an integer', 400);
  }

  if (req.body.duration !== undefined && req.body.duration <= 0) {
    throw new AppError('Tour duration must be a positive value', 400);
  }

  if (
    req.body.numberOfParticipants !== undefined &&
    !Number.isInteger(req.body.numberOfParticipants)
  ) {
    throw new AppError('Tour number of participants must be an integer', 400);
  }

  if (req.body.numberOfParticipants !== undefined && req.body.numberOfParticipants <= 0) {
    throw new AppError('Tour number of participants must be a positive value', 400);
  }

  if (req.body.rating !== undefined && (req.body.rating <= 0 || req.body.rating > 5)) {
    throw new AppError('Tour rating must be greater than 0 and less than or equal to 5', 400);
  }

  if (
    req.body.difficulty !== undefined &&
    (typeof req.body.difficulty !== 'string' ||
      !TOUR_DIFFICULTIES.includes(req.body.difficulty as Difficulty))
  ) {
    throw new AppError(`Tour difficulty must be one of: ${TOUR_DIFFICULTIES.join(', ')}`, 400);
  }

  // Build UpdateTourDto

  const updatedTourData: UpdateTourDto = {};

  for (const field of TOUR_EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) updatedTourData[field] = req.body[field];
  }

  const tour = await updateTour(tourId, updatedTourData);

  res.status(200).json({
    success: true,
    data: {
      tour,
    },
  });
};

export const deleteTourHandler = async (req: Request, res: Response) => {
  const tourId = parseId(req.params.id);

  await deleteTour(tourId);

  res.status(200).json({
    success: true,
  });
};
