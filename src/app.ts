import express from 'express';

import healthRouter from './routes/health.routes';
import toursRouter from './routes/tours.routes';
import authRouter from './routes/auth.routes';
import bookingsRouter from './routes/bookings.routes';
import { appErrorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';

const app = express();

app.use(express.json());

app.use('/health', healthRouter);
app.use('/tours', toursRouter);
app.use('/auth', authRouter);
app.use('/bookings', bookingsRouter);

app.use(notFoundHandler);
app.use(appErrorHandler);

export default app;
