import express, { Router } from 'express';
import { getHealth, getReadinessHandler } from '../controllers/health.controller';

const router: Router = express.Router();

router.get('/', getHealth);
router.get('/ready', getReadinessHandler);

export default router;
