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
