import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  assignCategoryToTour as assignCategoryToTourRepository,
  createCategory as createCategoryRepository,
  findCategoryById,
} from '../../../src/repositories/category.repository';
import { findTourById } from '../../../src/repositories/tours.repository';
import { createCategory, assignCategoryToTour } from '../../../src/services/category.service';
import type {
  CreateCategoryDto,
  CreateCategoryData,
  CategoryResponseDto,
  AssignCategoryToTourData,
  TourCategoryResponseDto,
} from '../../../src/dtos/category.dto';
import type { TourResponseDto } from '../../../src/dtos/tours.dto';
import { AppError } from '../../../src/utils/app-error';

vi.mock('../../../src/repositories/category.repository');
vi.mock('../../../src/repositories/tours.repository');

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

describe('assignCategoryToTour', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('assigns a category to a tour', async () => {
    const assignCategoryToTourData: AssignCategoryToTourData = { tourId: 1, categoryId: 100 };

    const tour: TourResponseDto = {
      id: 1,
      name: 'Test Tour',
      duration: 3,
      difficulty: 'EASY',
      rating: 4.5,
      numberOfParticipants: 10,
    };

    const category: CategoryResponseDto = {
      id: 100,
      name: 'Hiking',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const tourCategory: TourCategoryResponseDto = {
      id: 1,
      tourId: 1,
      categoryId: 100,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    vi.mocked(findTourById).mockResolvedValue(tour);
    vi.mocked(findCategoryById).mockResolvedValue(category);
    vi.mocked(assignCategoryToTourRepository).mockResolvedValue(tourCategory);

    await expect(assignCategoryToTour(assignCategoryToTourData)).resolves.toEqual(tourCategory);

    expect(assignCategoryToTourRepository).toHaveBeenCalledWith(assignCategoryToTourData);
  });

  it('throws 404 when a tour does not exist', async () => {
    const assignCategoryToTourData: AssignCategoryToTourData = { tourId: 1, categoryId: 100 };

    vi.mocked(findTourById).mockResolvedValue(null);

    await expect(assignCategoryToTour(assignCategoryToTourData)).rejects.toMatchObject({
      message: 'Tour not found',
      statusCode: 404,
    });

    expect(findTourById).toHaveBeenCalledWith(assignCategoryToTourData.tourId);
    expect(findCategoryById).not.toHaveBeenCalled();
    expect(assignCategoryToTourRepository).not.toHaveBeenCalled();
  });

  it('throws 404 when a category does not exist', async () => {
    const assignCategoryToTourData: AssignCategoryToTourData = { tourId: 1, categoryId: 100 };

    const tour: TourResponseDto = {
      id: 1,
      name: 'Test Tour',
      duration: 3,
      difficulty: 'EASY',
      rating: 4.5,
      numberOfParticipants: 10,
    };

    vi.mocked(findTourById).mockResolvedValue(tour);
    vi.mocked(findCategoryById).mockResolvedValue(null);

    await expect(assignCategoryToTour(assignCategoryToTourData)).rejects.toMatchObject({
      message: 'Category not found',
      statusCode: 404,
    });

    expect(findTourById).toHaveBeenCalledWith(assignCategoryToTourData.tourId);
    expect(findCategoryById).toHaveBeenCalledWith(assignCategoryToTourData.categoryId);
    expect(assignCategoryToTourRepository).not.toHaveBeenCalled();
  });

  it('throws 409 when a category is already assigned to a tour', async () => {
    const assignCategoryToTourData: AssignCategoryToTourData = { tourId: 1, categoryId: 100 };

    const tour: TourResponseDto = {
      id: 1,
      name: 'Test Tour',
      duration: 3,
      difficulty: 'EASY',
      rating: 4.5,
      numberOfParticipants: 10,
    };

    const category: CategoryResponseDto = {
      id: 100,
      name: 'Hiking',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const duplicateCategoryError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: 'test',
      },
    );

    vi.mocked(findTourById).mockResolvedValue(tour);
    vi.mocked(findCategoryById).mockResolvedValue(category);
    vi.mocked(assignCategoryToTourRepository).mockRejectedValue(duplicateCategoryError);

    const result = assignCategoryToTour(assignCategoryToTourData);

    await expect(result).rejects.toBeInstanceOf(AppError);
    await expect(result).rejects.toMatchObject({
      message: 'Category is already assigned to this tour',
      statusCode: 409,
    });

    expect(assignCategoryToTourRepository).toHaveBeenCalledWith(assignCategoryToTourData);
  });

  it('rethrows an unknown repository error', async () => {
    const assignCategoryToTourData: AssignCategoryToTourData = { tourId: 1, categoryId: 100 };

    const tour: TourResponseDto = {
      id: 1,
      name: 'Test Tour',
      duration: 3,
      difficulty: 'EASY',
      rating: 4.5,
      numberOfParticipants: 10,
    };

    const category: CategoryResponseDto = {
      id: 100,
      name: 'Hiking',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const unknownDatabaseError = new Error('Database connection failed');

    vi.mocked(findTourById).mockResolvedValue(tour);
    vi.mocked(findCategoryById).mockResolvedValue(category);
    vi.mocked(assignCategoryToTourRepository).mockRejectedValue(unknownDatabaseError);

    await expect(assignCategoryToTour(assignCategoryToTourData)).rejects.toBe(unknownDatabaseError);

    expect(findTourById).toHaveBeenCalledWith(assignCategoryToTourData.tourId);
    expect(findCategoryById).toHaveBeenCalledWith(assignCategoryToTourData.categoryId);
    expect(assignCategoryToTourRepository).toHaveBeenCalledWith(assignCategoryToTourData);
  });
});
