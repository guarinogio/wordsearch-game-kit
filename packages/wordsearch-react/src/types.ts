import type { CSSProperties } from 'react';

import type { GameState, ResponsiveOptions, WordSearchPuzzle, WordSearchTheme } from '@gioguarino/wordsearch-types';
import type { PixiWordSearchCallbacks, PixiWordSearchInstance } from '@gioguarino/wordsearch-pixi';

export type WordSearchBoardHandle = {
  getInstance: () => PixiWordSearchInstance | null;
  getGameState: () => GameState | null;
  restart: () => void;
  revealWords: () => void;
  resize: () => void;
};

export type WordSearchBoardProps = {
  puzzle: WordSearchPuzzle;
  theme?: Partial<WordSearchTheme>;
  responsive?: ResponsiveOptions;
  callbacks?: PixiWordSearchCallbacks;
  autoStart?: boolean;
  className?: string;
  style?: CSSProperties;
  onInstanceReady?: (instance: PixiWordSearchInstance) => void;
};
