import express, { Router } from 'express';
import { getToursHandler } from '../controllers/tours.controller';

const router: Router = express.Router();

router.get('/', getToursHandler);

export default router;
