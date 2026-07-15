import express, { Router } from 'express';
import {
  getToursHandler,
  getTourHandler,
  createTourHandler,
  updateTourHandler,
  deleteTourHandler,
} from '../controllers/tours.controller';
import {
  createReviewHandler,
  getReviewsForTourHandler,
  updateReviewHandler,
} from '../controllers/review.controller';
import { authenticateUser, requireRole } from '../middlewares/auth.middleware';

const router: Router = express.Router();

router.get('/', getToursHandler);
router.post('/', authenticateUser, requireRole('ADMIN'), createTourHandler);
router.patch('/:tourId/reviews/:reviewId', authenticateUser, updateReviewHandler);
router.get('/:tourId/reviews', getReviewsForTourHandler);
router.post('/:tourId/reviews', authenticateUser, createReviewHandler);
router.get('/:id', getTourHandler);
router.patch('/:id', authenticateUser, requireRole('ADMIN'), updateTourHandler);
router.delete('/:id', authenticateUser, requireRole('ADMIN'), deleteTourHandler);

export default router;
