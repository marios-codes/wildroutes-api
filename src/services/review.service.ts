import {
  createReview as createReviewRepository,
  countReviewsByTour,
  findReviewByUserAndTour,
  findReviewsByTour,
} from '../repositories/review.repository';
import { findTourById } from '../repositories/tours.repository';
import type { CreateReviewData, GetReviewsQueryDto, ReviewResponseDto } from '../dtos/review.dto';
import { AppError } from '../utils/app-error';

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

  const currentUserReviewOnTour = await findReviewByUserAndTour(
    reviewData.userId,
    reviewData.tourId,
  );
  if (currentUserReviewOnTour !== null) {
    throw new AppError('User must not have already reviewed this tour', 409);
  }
  return createReviewRepository(reviewData);
};
