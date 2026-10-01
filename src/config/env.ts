import 'dotenv/config';
import { parseRuntimeConfig } from './env.parser';

export const config = parseRuntimeConfig(process.env);
