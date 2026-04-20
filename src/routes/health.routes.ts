import express, { Router } from 'express';
import { getHealth } from '../controllers/health.controller';

const router: Router = express.Router();

router.get('/', getHealth);

export default router;
