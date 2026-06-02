import prisma from '../config/prisma';

type CreateUserData = {
  name: string;
  email: string;
  passwordHash: string;
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      passwordHash: true,
      role: true,
    },
  });
};

export const createUser = async (userData: CreateUserData) => {
  return prisma.user.create({
    data: userData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
};
