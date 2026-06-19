import { Request, Response } from 'express';
import { createReview, getReviewsForTour } from '../services/review.service';
import parseId from '../utils/parse-id';
import { validateCreateReviewBody, validateGetReviewsQuery } from '../validators/review.validator';
import type { CreateReviewData } from '../dtos/review.dto';
import { AppError } from '../utils/app-error';

export const getReviewsForTourHandler = async (req: Request, res: Response) => {
  const tourId = parseId(req.params.tourId);
  const query = validateGetReviewsQuery(req.query);

  const { reviews, pagination } = await getReviewsForTour(tourId, query);

  res.status(200).json({
    success: true,
    count: reviews.length,
    pagination,
    data: {
      reviews,
    },
  });
};

export const createReviewHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (userId === undefined) {
    throw new AppError('User must be authenticated', 401);
  }
  const tourId = parseId(req.params.tourId);
  const { rating, comment } = validateCreateReviewBody(req.body);

  const createReviewData: CreateReviewData = { rating, comment, userId, tourId };

  const review = await createReview(createReviewData);

  res.status(201).json({
    success: true,
    data: {
      review,
    },
  });
};
