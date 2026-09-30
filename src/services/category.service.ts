import { Prisma } from '@prisma/client';
import type {
  CategoryListItemDto,
  CreateCategoryDto,
  CreateCategoryData,
  CategoryResponseDto,
  TourCategoryResponseDto,
  AssignCategoryToTourData,
} from '../dtos/category.dto';
import {
  createCategory as createCategoryRepository,
  findAllCategories,
  assignCategoryToTour as assignCategoryToTourRepository,
  findCategoryById,
} from '../repositories/category.repository';
import { AppError } from '../utils/app-error';
import { findTourById } from '../repositories/tours.repository';

export const createCategory = async (
  categoryDto: CreateCategoryDto,
): Promise<CategoryResponseDto> => {
  const normalizedName = categoryDto.name.toLowerCase();
  const createCategoryData: CreateCategoryData = { name: categoryDto.name, normalizedName };
  try {
    return await createCategoryRepository(createCategoryData);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('Category name already exists', 409);
    }

    throw error;
  }
};

export const getCategories = async (): Promise<CategoryListItemDto[]> => {
  return findAllCategories();
};

export const assignCategoryToTour = async (
  assignCategoryToTourData: AssignCategoryToTourData,
): Promise<TourCategoryResponseDto> => {
  const tour = await findTourById(assignCategoryToTourData.tourId);
  if (tour === null) {
    throw new AppError('Tour not found', 404);
  }

  const category = await findCategoryById(assignCategoryToTourData.categoryId);
  if (category === null) {
    throw new AppError('Category not found', 404);
  }

  try {
    return await assignCategoryToTourRepository(assignCategoryToTourData);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('Category is already assigned to this tour', 409);
    }
    throw error;
  }
};
