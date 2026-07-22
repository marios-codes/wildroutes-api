import { Difficulty, Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  BookingResponseDto,
  CreateBookingData,
  GetBookingsQueryDto,
} from '../../../src/dtos/booking.dto';
import {
  countBookingsByUser,
  createBooking as createBookingRepository,
  findBookingsByUser,
} from '../../../src/repositories/booking.repository';
import { findTourById } from '../../../src/repositories/tours.repository';
import { createBooking, getBookingsForUser } from '../../../src/services/booking.service';

vi.mock('../../../src/repositories/booking.repository');
vi.mock('../../../src/repositories/tours.repository');

describe('createBooking', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('throws 404 when tour does not exist', async () => {
    const createBookingData: CreateBookingData = {
      userId: 10,
      tourId: 20,
    };

    vi.mocked(findTourById).mockResolvedValue(null);

    await expect(createBooking(createBookingData)).rejects.toMatchObject({
      message: 'Tour not found',
      statusCode: 404,
    });

    expect(findTourById).toHaveBeenCalledWith(createBookingData.tourId);
    expect(createBookingRepository).not.toHaveBeenCalled();
  });

  it('creates a booking for an existing tour', async () => {
    const createBookingData: CreateBookingData = {
      userId: 10,
      tourId: 20,
    };

    const tour = {
      id: createBookingData.tourId,
      name: 'Test tour',
      duration: 10,
      difficulty: Difficulty.EASY,
      rating: 4.5,
      numberOfParticipants: 10,
    };

    const booking: BookingResponseDto = {
      id: 1,
      userId: createBookingData.userId,
      tourId: createBookingData.tourId,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    vi.mocked(findTourById).mockResolvedValue(tour);
    vi.mocked(createBookingRepository).mockResolvedValue(booking);

    await expect(createBooking(createBookingData)).resolves.toEqual(booking);

    expect(findTourById).toHaveBeenCalledWith(createBookingData.tourId);
    expect(createBookingRepository).toHaveBeenCalledWith(createBookingData);
  });

  it('throws 409 when the user has already booked the tour', async () => {
    const createBookingData: CreateBookingData = {
      userId: 10,
      tourId: 20,
    };

    const tour = {
      id: createBookingData.tourId,
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

    expect(findTourById).toHaveBeenCalledWith(createBookingData.tourId);
    expect(createBookingRepository).toHaveBeenCalledWith(createBookingData);
  });
});

describe('getBookingsForUser', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns paginated bookings for the specified user', async () => {
    const userId = 10;
    const queryData: GetBookingsQueryDto = {
      page: 2,
      limit: 5,
    };

    const bookings: BookingResponseDto[] = [
      {
        id: 1,
        userId,
        tourId: 20,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ];

    vi.mocked(findBookingsByUser).mockResolvedValue(bookings);
    vi.mocked(countBookingsByUser).mockResolvedValue(12);

    await expect(getBookingsForUser(userId, queryData)).resolves.toEqual({
      bookings,
      pagination: {
        page: 2,
        limit: 5,
        totalItems: 12,
        totalPages: 3,
      },
    });

    expect(findBookingsByUser).toHaveBeenCalledWith({
      userId,
      skip: 5,
      take: 5,
    });
    expect(countBookingsByUser).toHaveBeenCalledWith(userId);
  });
});
