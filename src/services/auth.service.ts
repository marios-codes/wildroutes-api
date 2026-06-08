import bcrypt from 'bcrypt';
import type { LoginUserDto, RegisterUserDto, UserResponseDto } from '../dtos/auth.dto';
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

export const loginUser = async (loginUserData: LoginUserDto): Promise<UserResponseDto> => {
  const { email: loginEmail, password } = loginUserData;
  const existingUser = await findUserByEmail(loginEmail);
  if (existingUser === null) {
    throw new AppError('Invalid email or password', 401);
  }

  const isPasswordMatch = await bcrypt.compare(password, existingUser.passwordHash);

  if (!isPasswordMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  const { id, name, email, role } = existingUser;
  return { name, email, id, role };
};
