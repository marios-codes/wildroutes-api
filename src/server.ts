import { config } from './config/env';
import app from './app';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
