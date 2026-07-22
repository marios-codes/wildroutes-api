import prisma from '../config/prisma';
import type { BookingResponseDto, CreateBookingData } from '../dtos/booking.dto';

type FindBookingsByUserOptions = {
  userId: number;
  skip: number;
  take: number;
};

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

export const findBookingsByUser = async ({
  userId,
  skip,
  take,
}: FindBookingsByUserOptions): Promise<BookingResponseDto[]> => {
  return prisma.booking.findMany({
    where: { userId },
    skip,
    take,
    select: bookingSelect,
    orderBy: { id: 'asc' },
  });
};

export const countBookingsByUser = async (userId: number): Promise<number> => {
  return prisma.booking.count({ where: { userId } });
};
