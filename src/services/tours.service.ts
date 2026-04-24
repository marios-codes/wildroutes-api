import { findAllTours } from '../repositories/tours.repository';

export const getTours = async () => {
  return findAllTours();
};
