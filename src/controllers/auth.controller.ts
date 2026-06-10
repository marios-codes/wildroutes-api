import { Request, Response } from 'express';
import { validateRegisterUserBody, validateLoginUserBody } from '../validators/auth.validator';
import { registerUser, loginUser } from '../services/auth.service';
import type { AuthResponseDto } from '../dtos/auth.dto';
import { AppError } from '../utils/app-error';

export const registerUserHandler = async (req: Request, res: Response) => {
  const newUserData = validateRegisterUserBody(req.body);
  const { user, token }: AuthResponseDto = await registerUser(newUserData);

  res.status(201).json({
    success: true,
    data: {
      user,
      token,
    },
  });
};

export const loginUserHandler = async (req: Request, res: Response) => {
  const loginUserData = validateLoginUserBody(req.body);
  const { user, token }: AuthResponseDto = await loginUser(loginUserData);

  res.status(200).json({
    success: true,
    data: {
      user,
      token,
    },
  });
};

export const getCurrentUserHandler = (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401);
  }
  const { id, role } = req.user;
  res.status(200).json({
    success: true,
    data: {
      user: {
        id,
        role,
      },
    },
  });
};
