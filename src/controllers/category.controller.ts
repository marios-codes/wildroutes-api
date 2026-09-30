import { Request, Response } from 'express';
import { createCategory, getCategories, assignCategoryToTour } from '../services/category.service';
import {
  validateAssignCategoryToTourBody,
  validateCreateCategoryBody,
} from '../validators/category.validator';
import type { CreateCategoryDto, AssignCategoryToTourData } from '../dtos/category.dto';
import parseId from '../utils/parse-id';

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

export const assignCategoryToTourHandler = async (req: Request, res: Response) => {
  const tourId = parseId(req.params.tourId);
  const { categoryId } = validateAssignCategoryToTourBody(req.body);
  const assignCategoryToTourData: AssignCategoryToTourData = { tourId, categoryId };

  const tourCategory = await assignCategoryToTour(assignCategoryToTourData);

  res.status(201).json({
    success: true,
    data: {
      tourCategory,
    },
  });
};
