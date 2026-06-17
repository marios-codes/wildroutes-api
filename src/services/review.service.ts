import {
  createReview as createReviewRepository,
  findReviewByUserAndTour,
} from '../repositories/review.repository';
import { findTourById } from '../repositories/tours.repository';
import type { CreateReviewData, ReviewResponseDto } from '../dtos/review.dto';
import { AppError } from '../utils/app-error';

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
