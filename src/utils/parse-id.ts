import { AppError } from './app-error';

const parseId = (id: string | string[] | undefined): number => {
  if (typeof id !== 'string') {
    throw new AppError('ID must be a positive integer', 400);
  }

  const numericId = Number(id);

  if (!Number.isFinite(numericId) || !Number.isInteger(numericId) || numericId <= 0) {
    throw new AppError('ID must be a positive integer', 400);
  }

  return numericId;
};

export default parseId;
