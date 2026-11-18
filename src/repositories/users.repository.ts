import prisma from '../config/prisma';
import type { AuthenticatedUser, UserResponseDto } from '../dtos/auth.dto';

type UserWithPasswordHash = UserResponseDto & {
  passwordHash: string;
};

type CreateUserData = {
  name: string;
  email: string;
  passwordHash: string;
};

export const findUserByEmail = async (email: string): Promise<UserWithPasswordHash | null> => {
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

export const findAuthenticatedUserById = async (id: number): Promise<AuthenticatedUser | null> => {
  return prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      role: true,
    },
  });
};

export const createUser = async (userData: CreateUserData): Promise<UserResponseDto> => {
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
