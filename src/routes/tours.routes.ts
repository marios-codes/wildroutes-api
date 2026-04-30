import express, { Router } from 'express';
import { getToursHandler, getTourHandler } from '../controllers/tours.controller';

const router: Router = express.Router();

router.get('/', getToursHandler);
router.get('/:id', getTourHandler);

export default router;
