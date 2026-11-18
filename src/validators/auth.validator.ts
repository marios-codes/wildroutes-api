import { z } from 'zod';
import { LoginUserDto, RegisterUserDto } from '../dtos/auth.dto';
import { AppError } from '../utils/app-error';

const USER_NAME_MAX_LENGTH = 100;
const EMAIL_MAX_LENGTH = 254;
// bcrypt only uses the first 72 bytes of a password, so longer input adds no strength.
const PASSWORD_MAX_LENGTH = 72;

const emailSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value),
  z
    .email('User email is not valid')
    .max(EMAIL_MAX_LENGTH, `User email cannot exceed ${EMAIL_MAX_LENGTH} characters`),
);

const passwordMaxMessage = `User password cannot exceed ${PASSWORD_MAX_LENGTH} characters`;

const registerUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'User name must be a non-empty string')
      .max(USER_NAME_MAX_LENGTH, `User name cannot exceed ${USER_NAME_MAX_LENGTH} characters`),
    email: emailSchema,
    password: z
      .string()
      .min(8, 'User password must be at least 8 characters')
      .max(PASSWORD_MAX_LENGTH, passwordMaxMessage),
  })
  .strict();

const loginUserSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .nonempty('User password cannot be empty')
      .max(PASSWORD_MAX_LENGTH, passwordMaxMessage),
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
