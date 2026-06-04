import { Request, Response } from 'express';
import { validateRegisterUserBody } from '../validators/auth.validator';
import { registerUser } from '../services/auth.service';
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
