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
  const { page, limit, difficulty } = queryData;

  const skip = (page - 1) * limit;
  const take = limit;
  const tours = await findAllTours({ skip, take, difficulty });
  const totalItems = await countAllTours(difficulty);
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

  const updateTourDto: UpdateTourDto = {};

  if (tourData.name !== undefined) {
    updateTourDto.name = tourData.name;
  }

  if (tourData.duration !== undefined) {
    updateTourDto.duration = tourData.duration;
  }

  if (tourData.difficulty !== undefined) {
    updateTourDto.difficulty = tourData.difficulty;
  }

  if (tourData.rating !== undefined) {
    updateTourDto.rating = tourData.rating;
  }

  if (tourData.numberOfParticipants !== undefined) {
    updateTourDto.numberOfParticipants = tourData.numberOfParticipants;
  }

  return updateTourById(tourId, updateTourDto);
};

export const deleteTour = async (tourId: number) => {
  const tour = await findTourById(tourId);

  if (tour === null) {
    throw new AppError('Tour not found', 404);
  }

  return deleteTourById(tourId);
};
