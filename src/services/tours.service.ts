import { findAllTours } from '../repositories/tours.repository';

export const getTours = () => {
  return findAllTours();
};
