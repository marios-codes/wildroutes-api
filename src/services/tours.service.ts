import {
  findAllTours,
  findTourById,
  createTour as createTourRepository,
} from '../repositories/tours.repository';
import type { CreateTourDto } from '../dtos/tours.dto';
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
