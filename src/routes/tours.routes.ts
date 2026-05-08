import express, { Router } from 'express';
import {
  getToursHandler,
  getTourHandler,
  createTourHandler,
} from '../controllers/tours.controller';

const router: Router = express.Router();

router.get('/', getToursHandler);
router.post('/', createTourHandler);
router.get('/:id', getTourHandler);

export default router;
