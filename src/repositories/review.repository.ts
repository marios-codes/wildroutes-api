import prisma from '../config/prisma';
import type { CreateReviewData, ReviewResponseDto } from '../dtos/review.dto';

type FindReviewsByTourOptions = {
  tourId: number;
  skip: number;
  take: number;
};

const reviewSelect = {
  id: true,
  rating: true,
  comment: true,
  userId: true,
  tourId: true,
  createdAt: true,
  updatedAt: true,
};

export const findReviewByUserAndTour = async (
  userId: number,
  tourId: number,
): Promise<ReviewResponseDto | null> => {
  return prisma.review.findUnique({
    where: {
      userId_tourId: {
        userId,
        tourId,
      },
    },
    select: reviewSelect,
  });
};

export const findReviewsByTour = async ({
  tourId,
  skip,
  take,
}: FindReviewsByTourOptions): Promise<ReviewResponseDto[]> => {
  return prisma.review.findMany({
    where: { tourId },
    skip,
    take,
    select: reviewSelect,
    orderBy: { id: 'asc' },
  });
};

export const countReviewsByTour = async (tourId: number): Promise<number> => {
  return prisma.review.count({ where: { tourId } });
};

export const createReview = async (reviewData: CreateReviewData): Promise<ReviewResponseDto> => {
  return prisma.review.create({
    data: reviewData,
    select: reviewSelect,
  });
};
