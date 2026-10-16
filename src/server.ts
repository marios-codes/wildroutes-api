import { config } from './config/env';
import logger from './config/logger';
import { setTimeout, clearTimeout } from 'node:timers';
import app from './app';
import prisma from './config/prisma';
import { isShutdownInitiated, markShutdownStarted } from './lifecycle/shutdown-state';

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server listening');
});

const handleShutdown = (signal: 'SIGINT' | 'SIGTERM'): void => {
  if (isShutdownInitiated()) {
    return;
  }
  markShutdownStarted();
  logger.info({ signal }, 'Shutdown signal received');

  const shutdownTimer = setTimeout(() => {
    logger.error('Shutdown timed out');
    process.exit(1);
  }, 10_000);

  server.close((err) => {
    if (err) {
      logger.error({ error: err.name }, 'Server failed to shutdown');
      process.exitCode = 1;
      return;
    }
    logger.info('HTTP server closed');
    prisma
      .$disconnect()
      .then(() => {
        logger.info('Database disconnected');
        clearTimeout(shutdownTimer);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) {
          logger.error({ error: err.name }, 'Database failed to shutdown');
        } else {
          logger.error({ error: 'Unknown Error' }, 'Database failed to shutdown');
        }
        process.exitCode = 1;
      });
  });
};

process.on('SIGINT', () => {
  handleShutdown('SIGINT');
});

process.on('SIGTERM', () => {
  handleShutdown('SIGTERM');
});
