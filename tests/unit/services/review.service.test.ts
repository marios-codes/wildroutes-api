import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Difficulty, Prisma } from '@prisma/client';
import { createReview, deleteReview } from '../../../src/services/review.service';
import {
  createReview as createReviewRepository,
  deleteReviewById,
  findReviewById,
} from '../../../src/repositories/review.repository';
import { findTourById } from '../../../src/repositories/tours.repository';
import type {
  CreateReviewData,
  DeleteReviewData,
  ReviewResponseDto,
} from '../../../src/dtos/review.dto';

vi.mock('../../../src/repositories/review.repository');
vi.mock('../../../src/repositories/tours.repository');

describe('createReview', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('throws 409 when the database detects a duplicate review', async () => {
    const createReviewData: CreateReviewData = {
      rating: 4,
      comment: 'Test review',
      userId: 10,
      tourId: 20,
    };

    const tour = {
      id: createReviewData.tourId,
      name: 'Test tour',
      duration: 10,
      difficulty: Difficulty.EASY,
      rating: 4.5,
      numberOfParticipants: 10,
    };

    const duplicateReviewError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: 'test',
      },
    );

    vi.mocked(findTourById).mockResolvedValue(tour);
    vi.mocked(createReviewRepository).mockRejectedValue(duplicateReviewError);

    await expect(createReview(createReviewData)).rejects.toMatchObject({
      message: 'User must not have already reviewed this tour',
      statusCode: 409,
    });

    expect(findTourById).toHaveBeenCalledWith(createReviewData.tourId);
    expect(createReviewRepository).toHaveBeenCalledWith(createReviewData);
  });
});

describe('deleteReview', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('throws 404 when the review disappears before deletion', async () => {
    const review: ReviewResponseDto = {
      id: 1,
      rating: 4,
      comment: 'Test review',
      userId: 10,
      tourId: 20,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const deleteReviewData: DeleteReviewData = {
      reviewId: review.id,
      userId: review.userId,
      tourId: review.tourId,
    };

    vi.mocked(findReviewById).mockResolvedValue(review);
    vi.mocked(deleteReviewById).mockResolvedValue(false);

    await expect(deleteReview(deleteReviewData)).rejects.toMatchObject({
      message: 'Review not found',
      statusCode: 404,
    });

    expect(findReviewById).toHaveBeenCalledWith(review.id);
    expect(deleteReviewById).toHaveBeenCalledWith(review.id);
    expect(deleteReviewById).toHaveBeenCalledTimes(1);
  });
});
