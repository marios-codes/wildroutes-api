import { Request, Response } from 'express';
import { getTours, getTour } from '../services/tours.service';
import { AppError } from '../utils/app-error';

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
  const tourId = Number(req.params.id);

  if (isNaN(tourId)) {
    throw new AppError('Invalid tour id', 400);
  }

  const tour = await getTour(tourId);

  res.status(200).json({
    success: true,
    data: {
      tour,
    },
  });
};
