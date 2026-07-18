import prisma from '../config/prisma';
import type { BookingResponseDto, CreateBookingData } from '../dtos/booking.dto';

const bookingSelect = {
  id: true,
  userId: true,
  tourId: true,
  createdAt: true,
  updatedAt: true,
};

export const createBooking = async (
  bookingData: CreateBookingData,
): Promise<BookingResponseDto> => {
  return prisma.booking.create({
    data: bookingData,
    select: bookingSelect,
  });
};
