import express, { Router } from 'express';
import { registerUserHandler, loginUserHandler } from '../controllers/auth.controller';

const router: Router = express.Router();

router.post('/register', registerUserHandler);
router.post('/login', loginUserHandler);

export default router;
