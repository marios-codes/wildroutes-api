import bcrypt from 'bcrypt';
import type { RegisterUserDto, UserResponseDto } from '../dtos/auth.dto';
import { findUserByEmail, createUser } from '../repositories/users.repository';
import { AppError } from '../utils/app-error';

const BCRYPT_SALT_ROUNDS = 12;

export const registerUser = async (registerUserData: RegisterUserDto): Promise<UserResponseDto> => {
  const { name, email, password } = registerUserData;

  const existingUser = await findUserByEmail(email);
  if (existingUser !== null) {
    throw new AppError('Email is already in use', 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  return createUser({ name, email, passwordHash });
};
