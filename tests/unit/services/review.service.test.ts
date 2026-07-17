import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteReview } from '../../../src/services/review.service';
import { deleteReviewById, findReviewById } from '../../../src/repositories/review.repository';
import type { DeleteReviewData, ReviewResponseDto } from '../../../src/dtos/review.dto';

vi.mock('../../../src/repositories/review.repository');
vi.mock('../../../src/repositories/tours.repository');

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
