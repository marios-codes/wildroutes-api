import { beforeEach, describe, expect, it, vi } from 'vitest';
import { findTourById } from '../../../src/repositories/tours.repository';
import type { BookingResponseDto, CreateBookingData } from '../../../src/dtos/booking.dto';
import { Difficulty, Prisma } from '@prisma/client';
import { createBooking } from '../../../src/services/booking.service';
import { createBooking as createBookingRepository } from '../../../src/repositories/booking.repository';

vi.mock('../../../src/repositories/booking.repository');
vi.mock('../../../src/repositories/tours.repository');

describe('createBooking', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('throws 404 when tour does not exist', async () => {
    const booking: BookingResponseDto = {
      id: 1,
      userId: 10,
      tourId: 20,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const createBookingData: CreateBookingData = {
      userId: booking.userId,
      tourId: booking.tourId,
    };

    vi.mocked(findTourById).mockResolvedValue(null);

    await expect(createBooking(createBookingData)).rejects.toMatchObject({
      message: 'Tour not found',
      statusCode: 404,
    });

    expect(findTourById).toHaveBeenCalledWith(booking.tourId);
    expect(createBookingRepository).not.toHaveBeenCalled();
  });
  it('successfully returns booking and passes userId and tourId', async () => {
    const booking: BookingResponseDto = {
      id: 1,
      userId: 10,
      tourId: 20,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const createBookingData: CreateBookingData = {
      userId: booking.userId,
      tourId: booking.tourId,
    };

    const tour = {
      id: 20,
      name: 'Test tour',
      duration: 10,
      difficulty: Difficulty.EASY,
      rating: 4.5,
      numberOfParticipants: 10,
    };

    vi.mocked(findTourById).mockResolvedValue(tour);
    vi.mocked(createBookingRepository).mockResolvedValue(booking);

    await expect(createBooking(createBookingData)).resolves.toEqual(booking);

    expect(createBookingRepository).toHaveBeenCalledWith(createBookingData);
    expect(createBookingRepository).toHaveBeenCalledTimes(1);
  });

  it('throws 409 when the user has already booked the tour', async () => {
    const booking: BookingResponseDto = {
      id: 1,
      userId: 10,
      tourId: 20,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const createBookingData: CreateBookingData = {
      userId: booking.userId,
      tourId: booking.tourId,
    };

    const tour = {
      id: 20,
      name: 'Test tour',
      duration: 10,
      difficulty: Difficulty.EASY,
      rating: 4.5,
      numberOfParticipants: 10,
    };

    const duplicateBookingError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: 'test',
      },
    );

    vi.mocked(findTourById).mockResolvedValue(tour);
    vi.mocked(createBookingRepository).mockRejectedValue(duplicateBookingError);

    await expect(createBooking(createBookingData)).rejects.toMatchObject({
      message: 'User must not have already booked this tour',
      statusCode: 409,
    });

    expect(findTourById).toHaveBeenCalledWith(booking.tourId);
    expect(createBookingRepository).toHaveBeenCalledWith(createBookingData);
  });
});
