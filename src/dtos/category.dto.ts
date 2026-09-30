export type CreateCategoryDto = {
  name: string;
};

export type CreateCategoryData = CreateCategoryDto & {
  normalizedName: string;
};

export type CategoryResponseDto = {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

export type AssignCategoryToTourDto = {
  categoryId: number;
};

export type AssignCategoryToTourData = {
  tourId: number;
  categoryId: number;
};

export type TourCategoryResponseDto = {
  id: number;
  tourId: number;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryListItemDto = {
  id: number;
  name: string;
};
