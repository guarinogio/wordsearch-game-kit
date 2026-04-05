import type { Cell } from './puzzle';

export type GameStartedEvent = {
  type: 'game:started';
  timestamp: number;
};

export type GameRestartedEvent = {
  type: 'game:restarted';
  timestamp: number;
};

export type SelectionStartedEvent = {
  type: 'selection:started';
  cell: Cell;
  timestamp: number;
};

export type SelectionUpdatedEvent = {
  type: 'selection:updated';
  path: Cell[];
  timestamp: number;
};

export type SelectionCancelledEvent = {
  type: 'selection:cancelled';
  timestamp: number;
};

export type SelectionCommittedEvent = {
  type: 'selection:committed';
  path: Cell[];
  timestamp: number;
};

export type WordFoundEvent = {
  type: 'word:found';
  wordId: string;
  reverse: boolean;
  path: Cell[];
  score: number;
  delta: number;
  timestamp: number;
};

export type WordDuplicateEvent = {
  type: 'word:duplicate';
  wordId: string;
  path: Cell[];
  timestamp: number;
};

export type WordsRevealedEvent = {
  type: 'words:revealed';
  timestamp: number;
};

export type ScoreChangedEvent = {
  type: 'score:changed';
  score: number;
  delta: number;
  timestamp: number;
};

export type GameCompletedEvent = {
  type: 'game:completed';
  score: number;
  foundWordIds: string[];
  timestamp: number;
};

export type GameEvent =
  | GameStartedEvent
  | GameRestartedEvent
  | SelectionStartedEvent
  | SelectionUpdatedEvent
  | SelectionCancelledEvent
  | SelectionCommittedEvent
  | WordFoundEvent
  | WordDuplicateEvent
  | WordsRevealedEvent
  | ScoreChangedEvent
  | GameCompletedEvent;

export type GameEventListener = (event: GameEvent) => void;
