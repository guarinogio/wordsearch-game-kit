import type { Cell, Direction, WordSearchPuzzle } from './puzzle';

export type GameStatus = 'idle' | 'playing' | 'completed';

export type FoundWordState = {
  wordId: string;
  foundAtMove: number;
  foundAtTimestamp: number;
  path: Cell[];
  reverse: boolean;
};

export type ActiveSelection = {
  startCell: Cell;
  currentCell: Cell;
  direction: Direction | null;
  path: Cell[];
};

export type GameState = {
  status: GameStatus;
  puzzle: WordSearchPuzzle;
  foundWords: Record<string, FoundWordState>;
  foundWordIds: string[];
  revealedWords: boolean;
  selection: ActiveSelection | null;
  moves: number;
  score: number;
  startedAt: number | null;
  completedAt: number | null;
};

export type SelectionResult =
  | {
      kind: 'match';
      wordId: string;
      reverse: boolean;
      path: Cell[];
      scoreDelta: number;
      completedPuzzle: boolean;
    }
  | {
      kind: 'duplicate';
      wordId: string;
      path: Cell[];
    }
  | {
      kind: 'miss';
      path: Cell[];
    }
  | {
      kind: 'invalid';
      reason: 'empty-selection' | 'out-of-bounds' | 'non-linear-selection';
    };
