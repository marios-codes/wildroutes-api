import express, { Router } from 'express';
import { registerUserHandler } from '../controllers/auth.controller';

const router: Router = express.Router();

router.post('/register', registerUserHandler);

export default router;
