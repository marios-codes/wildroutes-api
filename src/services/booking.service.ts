import type { BookingResponseDto, CreateBookingData } from '../dtos/booking.dto';
import { findTourById } from '../repositories/tours.repository';
import { createBooking as createBookingRepository } from '../repositories/booking.repository';
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
