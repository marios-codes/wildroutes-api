import {
  findAllTours,
  countAllTours,
  findTourById,
  createTour as createTourRepository,
  updateTourById,
  deleteTourById,
} from '../repositories/tours.repository';
import type { CreateTourDto, GetToursQueryDto, UpdateTourDto } from '../dtos/tours.dto';
import { AppError } from '../utils/app-error';

export const getTours = async (queryData: GetToursQueryDto) => {
  const { page, limit } = queryData;

  const skip = (page - 1) * limit;
  const take = limit;
  const tours = await findAllTours({ skip, take });
  const totalItems = await countAllTours();
  const totalPages = Math.ceil(totalItems / limit);

  return {
    tours,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
};

export const getTour = async (tourId: number) => {
  const tour = await findTourById(tourId);

  if (tour === null) {
    throw new AppError('Tour not found', 404);
  }

  return tour;
};

export const createTour = async (tourData: CreateTourDto) => {
  return createTourRepository(tourData);
};

export const updateTour = async (tourId: number, tourData: UpdateTourDto) => {
  const tour = await findTourById(tourId);

  if (tour === null) {
    throw new AppError('Tour not found', 404);
  }

  return updateTourById(tourId, tourData);
};

export const deleteTour = async (tourId: number) => {
  const tour = await findTourById(tourId);

  if (tour === null) {
    throw new AppError('Tour not found', 404);
  }

  return deleteTourById(tourId);
};
