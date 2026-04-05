import type { GameStatus } from './game';

export type SerializableGameSnapshot = {
  puzzleId: string | number;
  foundWordIds: string[];
  revealedWords: boolean;
  score: number;
  moves: number;
  status: GameStatus;
  startedAt: number | null;
  completedAt: number | null;
};
