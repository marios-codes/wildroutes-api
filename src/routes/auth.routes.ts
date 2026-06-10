import express, { Router } from 'express';
import {
  registerUserHandler,
  loginUserHandler,
  getCurrentUserHandler,
} from '../controllers/auth.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router: Router = express.Router();

router.post('/register', registerUserHandler);
router.post('/login', loginUserHandler);
router.get('/me', authenticateUser, getCurrentUserHandler);

export default router;
