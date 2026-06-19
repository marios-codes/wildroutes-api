export type CreateReviewDto = {
  rating: number;
  comment: string;
};

export type CreateReviewData = {
  rating: number;
  comment: string;
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
