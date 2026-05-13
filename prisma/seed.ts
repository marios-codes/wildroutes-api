import 'dotenv/config';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const tours: Prisma.TourCreateManyInput[] = [
  {
    name: 'Forest Canyon Trail',
    duration: 3,
    difficulty: 'EASY',
    rating: 4.6,
    numberOfParticipants: 12,
  },
  {
    name: 'Alpine Ridge Expedition',
    duration: 7,
    difficulty: 'HARD',
    rating: 4.9,
    numberOfParticipants: 8,
  },
  {
    name: 'Coastal Sunrise Hike',
    duration: 4,
    difficulty: 'MEDIUM',
    rating: 4.7,
    numberOfParticipants: 15,
  },
  {
    name: 'Desert Night Trek',
    duration: 5,
    difficulty: 'MEDIUM',
    rating: 4.5,
    numberOfParticipants: 10,
  },
  {
    name: 'Glacier Valley Challenge',
    duration: 6,
    difficulty: 'HARD',
    rating: 4.8,
    numberOfParticipants: 6,
  },
];

const main = async (tours: Prisma.TourCreateManyInput[]) => {
  await prisma.$connect();
  await prisma.tour.deleteMany({});
  console.log('Deleted old tour records');
  await prisma.tour.createMany({ data: tours });
  console.log('Created new tour records');
};

const runSeed = async () => {
  try {
    await main(tours);
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

runSeed();
