import prisma from '../config/prisma';
import type { CreateCategoryData, CategoryResponseDto } from '../dtos/category.dto';

const categorySelect = {
  id: true,
  name: true,
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
