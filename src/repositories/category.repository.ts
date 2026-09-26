import prisma from '../config/prisma';
  CategoryListItemDto,

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

export const findAllCategories = async (): Promise<CategoryListItemDto[]> => {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: { name: 'asc' },
  });
};
