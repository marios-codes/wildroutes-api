export type CreateReviewDto = {
  rating: number;
  comment: string;
};

export type CreateReviewData = CreateReviewDto & {
  userId: number;
  tourId: number;
};

export type GetReviewsQueryDto = {
  page: number;
  limit: number;
};

export type ReviewResponseDto = {
  id: number;
  rating: number;
  comment: string;
  userId: number;
  tourId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdateReviewDto = {
  rating?: number;
  comment?: string;
};

export type UpdateReviewData = UpdateReviewDto & {
  userId: number;
  tourId: number;
  reviewId: number;
};
