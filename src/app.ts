import express from 'express';

import healthRouter from './routes/health.routes';
import toursRouter from './routes/tours.routes';

const app = express();

app.use('/health', healthRouter);
app.use('/tours', toursRouter);

export default app;
