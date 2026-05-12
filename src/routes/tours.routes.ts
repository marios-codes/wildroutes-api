import express, { Router } from 'express';
import {
  getToursHandler,
  getTourHandler,
  createTourHandler,
  updateTourHandler,
} from '../controllers/tours.controller';

const router: Router = express.Router();

router.get('/', getToursHandler);
router.post('/', createTourHandler);
router.get('/:id', getTourHandler);
router.patch('/:id', updateTourHandler);

export default router;
