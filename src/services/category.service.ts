import { Prisma } from '@prisma/client';
import type {
  CreateCategoryDto,
  CreateCategoryData,
  CategoryResponseDto,
} from '../dtos/category.dto';
import { createCategory as createCategoryRepository } from '../repositories/category.repository';
import { AppError } from '../utils/app-error';

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
