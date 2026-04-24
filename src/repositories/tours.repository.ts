import prisma from '../config/prisma';

export const findAllTours = async () => {
  return prisma.tour.findMany({
    select: {
      name: true,
      duration: true,
      difficulty: true,
      rating: true,
      numberOfParticipants: true,
    },
  });
};
