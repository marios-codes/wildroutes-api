import prisma from '../config/prisma';
import type { CreateTourDto, UpdateTourDto } from '../dtos/tours.dto';

export const findAllTours = async () => {
  return prisma.tour.findMany({
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
