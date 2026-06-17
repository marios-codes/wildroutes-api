import prisma from '../config/prisma';
import type { CreateReviewData } from '../dtos/review.dto';

export const findReviewByUserAndTour = async (userId: number, tourId: number) => {
  return prisma.review.findUnique({
    where: {
      userId_tourId: {
        userId,
        tourId,
      },
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      userId: true,
      tourId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const createReview = async (reviewData: CreateReviewData) => {
  return prisma.review.create({
    data: reviewData,
    select: {
      id: true,
      rating: true,
      comment: true,
      userId: true,
      tourId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};
