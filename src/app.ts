import express from 'express';
import helmet from 'helmet';

import healthRouter from './routes/health.routes';
import toursRouter from './routes/tours.routes';
import authRouter from './routes/auth.routes';
import bookingsRouter from './routes/bookings.routes';
import categoriesRouter from './routes/categories.routes';
import { appErrorHandler } from './middlewares/error.middleware';
import { notFoundHandler } from './middlewares/not-found.middleware';
import { requestIdHandler } from './middlewares/request-id.middleware';
import { requestLoggerHandler } from './middlewares/request-logging.middleware';

const app = express();

app.use(helmet());
app.use(requestIdHandler);
app.use(requestLoggerHandler);
// Largest legitimate body: a review comment of 2000 characters, each written as a 6-byte
// \uXXXX JSON escape in the worst case (12,000 bytes + about 26 of envelope). 16 KB leaves headroom.
app.use(express.json({ limit: '16kb' }));

app.use('/health', healthRouter);
app.use('/tours', toursRouter);
app.use('/auth', authRouter);
app.use('/bookings', bookingsRouter);
app.use('/categories', categoriesRouter);

app.use(notFoundHandler);
app.use(appErrorHandler);

export default app;
