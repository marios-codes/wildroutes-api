import prisma from '../config/prisma';
import type { CreateTourDto, UpdateTourDto, Difficulty } from '../dtos/tours.dto';

type FindAllToursOptions = {
  skip: number;
  take: number;
  difficulty?: Difficulty;
};

export const findAllTours = async ({ skip, take, difficulty }: FindAllToursOptions) => {
  return prisma.tour.findMany({
    skip,
    take,
    select: {
      id: true,
      name: true,
      duration: true,
      difficulty: true,
      rating: true,
      numberOfParticipants: true,
    },
    where: difficulty !== undefined ? { difficulty } : undefined,
    orderBy: { id: 'asc' },
  });
};

export const countAllTours = async (difficulty?: Difficulty) => {
  if (difficulty !== undefined) {
    return prisma.tour.count({ where: { difficulty } });
  }
  return prisma.tour.count();
};

export const findTourById = async (tourId: number) => {
  return prisma.tour.findUnique({
    where: {
      id: tourId,
    },
    select: {
      id: true,
      name: true,
      duration: true,
      difficulty: true,
      rating: true,
      numberOfParticipants: true,
    },
  });
};

export const createTour = async (tourData: CreateTourDto) => {
  return prisma.tour.create({
    data: tourData,
    select: {
      id: true,
      name: true,
      duration: true,
      difficulty: true,
      rating: true,
      numberOfParticipants: true,
    },
  });
};

export const updateTourById = async (tourId: number, tourData: UpdateTourDto) => {
  return prisma.tour.update({
    where: { id: tourId },
    data: tourData,
    select: {
      id: true,
      name: true,
      duration: true,
      difficulty: true,
      rating: true,
      numberOfParticipants: true,
    },
  });
};

export const deleteTourById = async (tourId: number) => {
  return prisma.tour.delete({
    where: { id: tourId },
  });
};
