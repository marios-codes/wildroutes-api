import bcrypt from 'bcrypt';
import type { AuthResponseDto, LoginUserDto, RegisterUserDto } from '../dtos/auth.dto';
import { findUserByEmail, createUser } from '../repositories/users.repository';
import { AppError } from '../utils/app-error';
import { signAuthToken } from '../utils/jwt';

const BCRYPT_SALT_ROUNDS = 12;

export const registerUser = async (registerUserData: RegisterUserDto): Promise<AuthResponseDto> => {
  const { name, email, password } = registerUserData;

  const existingUser = await findUserByEmail(email);
  if (existingUser !== null) {
    throw new AppError('Email is already in use', 409);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

  const newUser = await createUser({ name, email, passwordHash });
  const token = signAuthToken(newUser.id, newUser.role);

  return { user: newUser, token };
};

export const loginUser = async (loginUserData: LoginUserDto): Promise<AuthResponseDto> => {
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
  const user = { id, name, email, role };
  const token = signAuthToken(user.id, user.role);
  return { user, token };
};
