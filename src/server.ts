import { config } from './config/env';
import logger from './config/logger';
import app from './app';

const PORT = config.port;

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server listening');
});
