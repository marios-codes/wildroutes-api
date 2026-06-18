import express, { Router } from 'express';
import {
  getToursHandler,
  getTourHandler,
  createTourHandler,
  updateTourHandler,
  deleteTourHandler,
} from '../controllers/tours.controller';
import { createReviewHandler } from '../controllers/review.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router: Router = express.Router();

router.get('/', getToursHandler);
router.post('/', createTourHandler);
router.get('/:id', getTourHandler);
router.patch('/:id', updateTourHandler);
router.delete('/:id', deleteTourHandler);

router.post('/:tourId/reviews', authenticateUser, createReviewHandler);

export default router;
