import express, { Request, Response } from 'express';

const app = express();

app.get('/health', (req: Request, res: Response) => {
  res.json({ message: 'Server is up and running' });
});

export default app;
