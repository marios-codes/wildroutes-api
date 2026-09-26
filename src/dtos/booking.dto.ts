import type { PaginationDto } from './pagination.dto';

export type CreateBookingData = {
  userId: number;
  tourId: number;
};

export type BookingResponseDto = {
  id: number;
  userId: number;
  tourId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type GetBookingsQueryDto = {
  page: number;
  limit: number;
};

export type BookingListResponseDto = {
  bookings: BookingResponseDto[];
  pagination: PaginationDto;
};
