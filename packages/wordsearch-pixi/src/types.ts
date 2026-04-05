import type {
  LayoutMetrics,
  ResponsiveOptions,
  WordSearchPuzzle,
  WordSearchTheme,
} from '@gioguarino/wordsearch-types';

import type { WordSearchGame } from '@gioguarino/wordsearch-core';

export type PixiWordSearchOptions = {
  container: HTMLElement;
  puzzle: WordSearchPuzzle;
  game?: WordSearchGame;
  theme?: Partial<WordSearchTheme>;
  responsive?: ResponsiveOptions;
  autoStart?: boolean;
};

export type PixiWordSearchInstance = {
  getGame(): WordSearchGame;
  getPuzzle(): WordSearchPuzzle;
  getTheme(): WordSearchTheme;
  getLayoutMetrics(): LayoutMetrics | null;
  resize(): void;
  setPuzzle(puzzle: WordSearchPuzzle): void;
  destroy(): void;
};
