import { z } from 'zod';
import { LoginUserDto, RegisterUserDto } from '../dtos/auth.dto';
import { AppError } from '../utils/app-error';

const emailSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
  z.email('User email is not valid'),
);

const registerUserSchema = z
  .object({
    name: z.string().trim().min(1, 'User name must be a non-empty string'),
    email: emailSchema,
    password: z.string().min(8, 'User password must be at least 8 characters'),
  })
  .strict();

const loginUserSchema = z
  .object({
    email: emailSchema,
    password: z.string().nonempty('User password cannot be empty'),
  })
  .strict();

export const validateRegisterUserBody = (reqBody: unknown): RegisterUserDto => {
  const validationResult = registerUserSchema.safeParse(reqBody);

  if (!validationResult.success) {
    const message = validationResult.error.issues[0]?.message ?? 'Invalid user data';
    throw new AppError(message, 400);
  }

  return validationResult.data;
};

export const validateLoginUserBody = (reqBody: unknown): LoginUserDto => {
  const validationResult = loginUserSchema.safeParse(reqBody);

  if (!validationResult.success) {
    const message = validationResult.error.issues[0]?.message ?? 'Invalid email and/or password';
    throw new AppError(message, 400);
  }

  return validationResult.data;
};
