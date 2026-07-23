import { Request, Response } from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingsForUser,
} from '../services/booking.service';
import parseId from '../utils/parse-id';
import { AppError } from '../utils/app-error';
import type { CreateBookingData } from '../dtos/booking.dto';
import { validateGetBookingsQuery } from '../validators/booking.validator';

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

export const getCurrentUserBookingsHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (userId === undefined) {
    throw new AppError('User must be authenticated', 401);
  }
  const query = validateGetBookingsQuery(req.query);

  const { bookings, pagination } = await getBookingsForUser(userId, query);

  res.status(200).json({
    success: true,
    count: bookings.length,
    pagination,
    data: {
      bookings,
    },
  });
};

export const getAllBookingsHandler = async (req: Request, res: Response) => {
  const query = validateGetBookingsQuery(req.query);
  const { bookings, pagination } = await getAllBookings(query);

  res.status(200).json({
    success: true,
    count: bookings.length,
    pagination,
    data: {
      bookings,
    },
  });
};
