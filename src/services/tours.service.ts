import {
  findAllTours,
  findTourById,
  createTour as createTourRepository,
  updateTourById,
} from '../repositories/tours.repository';
import type { CreateTourDto, UpdateTourDto } from '../dtos/tours.dto';
import { AppError } from '../utils/app-error';

export const getTours = async () => {
  return findAllTours();
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
