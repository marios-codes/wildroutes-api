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
