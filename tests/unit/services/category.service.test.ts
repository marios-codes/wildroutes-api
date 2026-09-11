import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCategory as createCategoryRepository } from '../../../src/repositories/category.repository';
import { createCategory } from '../../../src/services/category.service';
import type {
  CreateCategoryDto,
  CreateCategoryData,
  CategoryResponseDto,
} from '../../../src/dtos/category.dto';
import { AppError } from '../../../src/utils/app-error';

vi.mock('../../../src/repositories/category.repository');

describe('createCategory', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('creates a category', async () => {
    const createCategoryDto: CreateCategoryDto = { name: 'Hiking' };
    const createCategoryData: CreateCategoryData = {
      name: createCategoryDto.name,
      normalizedName: 'hiking',
    };

    const category: CategoryResponseDto = {
      id: 1,
      name: createCategoryData.name,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    vi.mocked(createCategoryRepository).mockResolvedValue(category);

    await expect(createCategory(createCategoryDto)).resolves.toEqual(category);

    expect(createCategoryRepository).toHaveBeenCalledWith(createCategoryData);
  });

  it('throws 409 when a category with the same normalized name already exists', async () => {
    const createCategoryDto: CreateCategoryDto = { name: 'Hiking' };
    const createCategoryData: CreateCategoryData = {
      name: createCategoryDto.name,
      normalizedName: 'hiking',
    };

    const duplicateCategoryError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: 'test',
      },
    );

    vi.mocked(createCategoryRepository).mockRejectedValue(duplicateCategoryError);

    const result = createCategory(createCategoryDto);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({
      message: 'Category name already exists',
      statusCode: 409,
    });

    expect(createCategoryRepository).toHaveBeenCalledWith(createCategoryData);
  });

  it('rethrows an unknown repository error', async () => {
    const createCategoryDto: CreateCategoryDto = {
      name: 'Hiking',
    };

    const createCategoryData: CreateCategoryData = {
      name: createCategoryDto.name,
      normalizedName: 'hiking',
    };

    const unknownDatabaseError = new Error('Database connection failed');

    vi.mocked(createCategoryRepository).mockRejectedValue(unknownDatabaseError);

    await expect(createCategory(createCategoryDto)).rejects.toBe(unknownDatabaseError);

    expect(createCategoryRepository).toHaveBeenCalledWith(createCategoryData);
  });
});
