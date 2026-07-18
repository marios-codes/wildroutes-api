import {
  createReview as createReviewRepository,
  countReviewsByTour,
  findReviewsByTour,
  findReviewById,
  updateReviewById,
  deleteReviewById,
} from '../repositories/review.repository';
import { findTourById } from '../repositories/tours.repository';
import type {
  CreateReviewData,
  GetReviewsQueryDto,
  ReviewResponseDto,
  UpdateReviewDto,
  UpdateReviewData,
  DeleteReviewData,
} from '../dtos/review.dto';
import { AppError } from '../utils/app-error';
import { Prisma } from '@prisma/client';

export const getReviewsForTour = async (tourId: number, queryData: GetReviewsQueryDto) => {
  const tour = await findTourById(tourId);

  if (tour === null) {
    throw new AppError('Tour not found', 404);
  }

  const { page, limit } = queryData;
  const skip = (page - 1) * limit;
  const take = limit;

  const reviews = await findReviewsByTour({ tourId, skip, take });
  const totalItems = await countReviewsByTour(tourId);
  const totalPages = Math.ceil(totalItems / limit);

  return {
    reviews,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
};

export const createReview = async (reviewData: CreateReviewData): Promise<ReviewResponseDto> => {
  const tour = await findTourById(reviewData.tourId);

  if (tour === null) {
    throw new AppError('Tour not found', 404);
  }

  try {
    return await createReviewRepository(reviewData);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('User must not have already reviewed this tour', 409);
    }

    throw error;
  }
};

export const updateReview = async (reviewData: UpdateReviewData): Promise<ReviewResponseDto> => {
  const review = await findReviewById(reviewData.reviewId);

  if (review === null) {
    throw new AppError('Review not found', 404);
  }

  if (review.tourId !== reviewData.tourId) {
    throw new AppError('Review belongs to different tour', 404);
  }

  if (review.userId !== reviewData.userId) {
    throw new AppError('Review belongs to different user', 403);
  }

  const updateReviewDto: UpdateReviewDto = {};

  if (reviewData.rating !== undefined) {
    updateReviewDto.rating = reviewData.rating;
  }

  if (reviewData.comment !== undefined) {
    updateReviewDto.comment = reviewData.comment;
  }

  return updateReviewById(review.id, updateReviewDto);
};

export const deleteReview = async (reviewData: DeleteReviewData): Promise<void> => {
  const review = await findReviewById(reviewData.reviewId);

  if (review === null) {
    throw new AppError('Review not found', 404);
  }

  if (review.tourId !== reviewData.tourId) {
    throw new AppError('Review belongs to different tour', 404);
  }

  if (review.userId !== reviewData.userId) {
    throw new AppError('Review belongs to different user', 403);
  }

  const wasReviewDeleted = await deleteReviewById(review.id);

  if (!wasReviewDeleted) {
    throw new AppError('Review not found', 404);
  }
};
