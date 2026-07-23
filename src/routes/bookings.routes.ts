import express, { Router } from 'express';
import {
  getAllBookingsHandler,
  getCurrentUserBookingsHandler,
} from '../controllers/booking.controller';
import { authenticateUser, requireRole } from '../middlewares/auth.middleware';

const router: Router = express.Router();

router.get('/me', authenticateUser, getCurrentUserBookingsHandler);
router.get('/', authenticateUser, requireRole('ADMIN'), getAllBookingsHandler);

export default router;
