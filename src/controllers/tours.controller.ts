import { Request, Response } from 'express';
import { getTours } from '../services/tours.service';

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
