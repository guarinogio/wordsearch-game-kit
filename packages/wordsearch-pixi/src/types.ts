import type { WordSearchGame } from '@gioguarino/wordsearch-core';

import type {
  Cell,
  GameCompletedEvent,
  GameEvent,
  LayoutMetrics,
  ResponsiveOptions,
  SelectionCommittedEvent,
  SelectionStartedEvent,
  SelectionUpdatedEvent,
  WordDuplicateEvent,
  WordFoundEvent,
  WordSearchPuzzle,
  WordSearchTheme,
  WordsRevealedEvent,
} from '@gioguarino/wordsearch-types';

export type PixiWordSearchCallbacks = {
  onReady?: (instance: PixiWordSearchInstance) => void;
  onEvent?: (event: GameEvent) => void;
  onSelectionStart?: (event: SelectionStartedEvent) => void;
  onSelectionChange?: (event: SelectionUpdatedEvent) => void;
  onSelectionCommit?: (event: SelectionCommittedEvent) => void;
  onWordFound?: (event: WordFoundEvent) => void;
  onWordDuplicate?: (event: WordDuplicateEvent) => void;
  onWordsRevealed?: (event: WordsRevealedEvent) => void;
  onComplete?: (event: GameCompletedEvent) => void;
  onMissSelection?: (path: Cell[]) => void;
};

export type PixiWordSearchOptions = {
  container: HTMLElement;
  puzzle: WordSearchPuzzle;
  game?: WordSearchGame;
  theme?: Partial<WordSearchTheme>;
  responsive?: ResponsiveOptions;
  callbacks?: PixiWordSearchCallbacks;
  autoStart?: boolean;
};

export type PixiWordSearchInstance = {
  getGame(): WordSearchGame;
  getPuzzle(): WordSearchPuzzle;
  getTheme(): WordSearchTheme;
  getLayoutMetrics(): LayoutMetrics | null;
  resize(): void;
  resetView(): void;
  setPuzzle(puzzle: WordSearchPuzzle): void;
  destroy(): void;
};
