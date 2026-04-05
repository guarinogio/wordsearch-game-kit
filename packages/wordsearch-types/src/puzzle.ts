export type Cell = {
  row: number;
  col: number;
};

export type Direction = 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW';

export type WordSearchWord = {
  id: string;
  label: string;
  value: string;
};

export type WordSearchPlacement = {
  wordId: string;
  label: string;
  value: string;
  start: Cell;
  end: Cell;
  direction: Direction;
  path: Cell[];
};

export type WordSearchPuzzle = {
  id: string | number;
  size: number;
  topic?: string;
  grid: string[][];
  words: WordSearchWord[];
  placements: WordSearchPlacement[];
};
