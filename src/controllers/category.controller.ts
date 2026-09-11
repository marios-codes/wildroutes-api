import { Request, Response } from 'express';
import { createCategory } from '../services/category.service';
import { validateCreateCategoryBody } from '../validators/category.validator';
import type { CreateCategoryDto } from '../dtos/category.dto';

export const createCategoryHandler = async (req: Request, res: Response) => {
  const { name } = validateCreateCategoryBody(req.body);
  const createCategoryDto: CreateCategoryDto = { name };

  const category = await createCategory(createCategoryDto);

  res.status(201).json({
    success: true,
    data: {
      category,
    },
  });
};
