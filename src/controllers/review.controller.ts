import { Request, Response } from 'express';
import { createReview } from '../services/review.service';
import parseId from '../utils/parse-id';
import { validateCreateReviewBody } from '../validators/review.validator';
import type { CreateReviewData } from '../dtos/review.dto';
import { AppError } from '../utils/app-error';

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
