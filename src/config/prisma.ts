import { config } from './env';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = config.databaseUrl;

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

export default prisma;
