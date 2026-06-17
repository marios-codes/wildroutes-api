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
