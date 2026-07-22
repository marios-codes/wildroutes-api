import express, { Router } from 'express';
import { getCurrentUserBookingsHandler } from '../controllers/booking.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router: Router = express.Router();

router.get('/me', authenticateUser, getCurrentUserBookingsHandler);

export default router;
