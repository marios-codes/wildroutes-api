import express from 'express';

import healthRouter from './routes/health.routes';
import toursRouter from './routes/tours.routes';
import { appErrorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';

const app = express();

app.use('/health', healthRouter);
app.use('/tours', toursRouter);

app.use(notFoundHandler);
app.use(appErrorHandler);

export default app;
