import { Request, Response } from 'express';
import { createCategory, getCategories } from '../services/category.service';
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

export const getCategoriesHandler = async (_req: Request, res: Response) => {
  const categories = await getCategories();

  res.status(200).json({
    success: true,
    data: {
      categories,
    },
    count: categories.length,
  });
};
