import { Request, Response } from 'express';
import { getTours, getTour, createTour, updateTour, deleteTour } from '../services/tours.service';
import parseId from '../utils/parse-id';
import {
  validateCreateTourBody,
  validateUpdateTourBody,
  validateGetToursQuery,
} from '../validators/tours.validator';

export const getToursHandler = async (req: Request, res: Response) => {
  const query = validateGetToursQuery(req.query);
  const { tours, pagination } = await getTours(query);

  res.status(200).json({
    success: true,
    count: tours.length,
    pagination,
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
  const updatedTourData = validateUpdateTourBody(req.body);

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
