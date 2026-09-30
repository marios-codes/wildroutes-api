import prisma from '../config/prisma';
import type {
  CategoryListItemDto,
  CreateCategoryData,
  CategoryResponseDto,
  AssignCategoryToTourData,
  TourCategoryResponseDto,
} from '../dtos/category.dto';

const categorySelect = {
  id: true,
  name: true,
  createdAt: true,
  updatedAt: true,
};

const tourCategorySelect = {
  id: true,
  tourId: true,
  categoryId: true,
  createdAt: true,
  updatedAt: true,
};

export const createCategory = async (
  categoryData: CreateCategoryData,
): Promise<CategoryResponseDto> => {
  return prisma.category.create({
    data: categoryData,
    select: categorySelect,
  });
};

export const findAllCategories = async (): Promise<CategoryListItemDto[]> => {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  });
};

export const findCategoryById = async (categoryId: number): Promise<CategoryResponseDto | null> => {
  return prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    select: categorySelect,
  });
};

export const assignCategoryToTour = async (
  tourCategoryData: AssignCategoryToTourData,
): Promise<TourCategoryResponseDto> => {
  return prisma.tourCategory.create({
    data: tourCategoryData,
    select: tourCategorySelect,
  });
};
