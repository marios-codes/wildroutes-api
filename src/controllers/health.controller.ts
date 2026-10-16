import { Request, Response } from 'express';
import { getReadiness } from '../services/health.service';

export const getHealth = (req: Request, res: Response) => {
  res.json({ message: 'Server is up and running' });
};

export const getReadinessHandler = async (_req: Request, res: Response): Promise<void> => {
  const readiness = await getReadiness();
  const statusCode = readiness.status === 'ready' ? 200 : 503;

  res.status(statusCode).json(readiness);
};
