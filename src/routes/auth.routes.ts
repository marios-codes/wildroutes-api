import express, { Router } from 'express';
import {
  registerUserHandler,
  loginUserHandler,
  getCurrentUserHandler,
} from '../controllers/auth.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { loginRateLimiter, registerRateLimiter } from '../middlewares/rate-limit.middleware';

const router: Router = express.Router();

router.post('/register', registerRateLimiter, registerUserHandler);
router.post('/login', loginRateLimiter, loginUserHandler);
router.get('/me', authenticateUser, getCurrentUserHandler);

export default router;
