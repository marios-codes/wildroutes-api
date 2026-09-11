import express, { Router } from 'express';
import { createCategoryHandler } from '../controllers/category.controller';
import { authenticateUser, requireRole } from '../middlewares/auth.middleware';

const router: Router = express.Router();

router.post('/', authenticateUser, requireRole('ADMIN'), createCategoryHandler);

export default router;
