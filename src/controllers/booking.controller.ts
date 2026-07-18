import { Request, Response } from 'express';
import { createBooking } from '../services/booking.service';
import parseId from '../utils/parse-id';
import { AppError } from '../utils/app-error';
import type { CreateBookingData } from '../dtos/booking.dto';

export const createBookingHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (userId === undefined) {
    throw new AppError('User must be authenticated', 401);
  }

  const tourId = parseId(req.params.tourId);
  const createBookingData: CreateBookingData = { userId, tourId };

  const booking = await createBooking(createBookingData);

  res.status(201).json({
    success: true,
    data: {
      booking,
    },
  });
};
