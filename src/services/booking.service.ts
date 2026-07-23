import type {
  BookingResponseDto,
  CreateBookingData,
  GetBookingsQueryDto,
} from '../dtos/booking.dto';
import { findTourById } from '../repositories/tours.repository';
import {
  countAllBookings,
  countBookingsByUser,
  createBooking as createBookingRepository,
  findAllBookings,
  findBookingsByUser,
} from '../repositories/booking.repository';
import { AppError } from '../utils/app-error';
import { Prisma } from '@prisma/client';

export const createBooking = async (
  bookingData: CreateBookingData,
): Promise<BookingResponseDto> => {
  const tour = await findTourById(bookingData.tourId);

  if (tour === null) {
    throw new AppError('Tour not found', 404);
  }

  try {
    return await createBookingRepository(bookingData);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('User must not have already booked this tour', 409);
    }

    throw error;
  }
};

export const getBookingsForUser = async (userId: number, queryData: GetBookingsQueryDto) => {
  const { page, limit } = queryData;
  const skip = (page - 1) * limit;
  const take = limit;

  const bookings = await findBookingsByUser({ userId, skip, take });
  const totalItems = await countBookingsByUser(userId);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    bookings,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
};

export const getAllBookings = async (queryData: GetBookingsQueryDto) => {
  const { page, limit } = queryData;
  const skip = (page - 1) * limit;
  const take = limit;

  const bookings = await findAllBookings({ skip, take });
  const totalItems = await countAllBookings();
  const totalPages = Math.ceil(totalItems / limit);

  return {
    bookings,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
};
