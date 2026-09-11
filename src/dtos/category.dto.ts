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
