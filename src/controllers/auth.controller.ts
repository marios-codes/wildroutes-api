import { Request, Response } from 'express';
import { validateRegisterUserBody, validateLoginUserBody } from '../validators/auth.validator';
import { registerUser, loginUser } from '../services/auth.service';
import type { UserResponseDto } from '../dtos/auth.dto';

export const registerUserHandler = async (req: Request, res: Response) => {
  const newUserData = validateRegisterUserBody(req.body);
  const user: UserResponseDto = await registerUser(newUserData);

  res.status(201).json({
    success: true,
    data: {
      user,
    },
  });
};

export const loginUserHandler = async (req: Request, res: Response) => {
  const loginUserData = validateLoginUserBody(req.body);
  const user: UserResponseDto = await loginUser(loginUserData);

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
};
