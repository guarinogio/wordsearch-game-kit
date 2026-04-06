import type { SerializableGameSnapshot } from '@gioguarino/wordsearch-types';

export type ShellPuzzleProgress = {
  puzzleId: string;
  foundWordIds: string[];
  foundCount: number;
  completed: boolean;
  revealedWords: boolean;
  completedAt: number | null;
  lastPlayedAt: number | null;
  snapshot: SerializableGameSnapshot | null;
};

export type ShellDailySessionState = {
  sessionId: string;
  date: string;
  topic: string;
  activePuzzleId: string;
  puzzles: Record<string, ShellPuzzleProgress>;
};

export type ShellPuzzleProgressPatch = Partial<ShellPuzzleProgress>;
