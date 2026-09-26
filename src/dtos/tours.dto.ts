import type { PaginationDto } from './pagination.dto';

export const TOUR_DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const;

export type Difficulty = (typeof TOUR_DIFFICULTIES)[number];

export type CreateTourDto = {
  name: string;
  duration: number;
  difficulty: Difficulty;
  rating: number;
  numberOfParticipants: number;
};

export type UpdateTourDto = {
  name?: string;
  duration?: number;
  difficulty?: Difficulty;
  rating?: number;
  numberOfParticipants?: number;
};

export type GetToursQueryDto = {
  page: number;
  limit: number;
  difficulty?: Difficulty;
};

export type TourResponseDto = {
  id: number;
  name: string;
  duration: number;
  difficulty: Difficulty;
  rating: number;
  numberOfParticipants: number;
};

export type TourListResponseDto = {
  tours: TourResponseDto[];
  pagination: PaginationDto;
};
