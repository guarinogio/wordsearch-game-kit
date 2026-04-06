import type {
  GameState,
  SerializableGameSnapshot,
  WordSearchPuzzle,
} from '@gioguarino/wordsearch-types';

export const testPuzzle: WordSearchPuzzle = {
  id: 'react-test-puzzle',
  size: 4,
  topic: 'Test',
  grid: [
    ['C', 'U', 'P', 'X'],
    ['X', 'X', 'X', 'X'],
    ['M', 'U', 'G', 'X'],
    ['T', 'E', 'A', 'X'],
  ],
  words: [
    { id: 'cup', label: 'Cup', value: 'CUP' },
    { id: 'mug', label: 'Mug', value: 'MUG' },
    { id: 'tea', label: 'Tea', value: 'TEA' },
  ],
  placements: [
    {
      wordId: 'cup',
      label: 'Cup',
      value: 'CUP',
      start: { row: 0, col: 0 },
      end: { row: 0, col: 2 },
      direction: 'E',
      path: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ],
    },
    {
      wordId: 'mug',
      label: 'Mug',
      value: 'MUG',
      start: { row: 2, col: 0 },
      end: { row: 2, col: 2 },
      direction: 'E',
      path: [
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
      ],
    },
    {
      wordId: 'tea',
      label: 'Tea',
      value: 'TEA',
      start: { row: 3, col: 0 },
      end: { row: 3, col: 2 },
      direction: 'E',
      path: [
        { row: 3, col: 0 },
        { row: 3, col: 1 },
        { row: 3, col: 2 },
      ],
    },
  ],
};

export function createTestSnapshot(
  puzzleId = 'react-test-puzzle',
): SerializableGameSnapshot {
  return {
    puzzleId,
    status: 'playing',
    foundWordIds: ['cup'],
    score: 100,
    moves: 1,
    startedAt: 1,
    completedAt: null,
    revealedWords: false,
  };
}

export function createTestGameState(
  puzzle: WordSearchPuzzle = testPuzzle,
): GameState {
  return {
    puzzle,
    status: 'playing',
    selection: null,
    foundWords: {},
    foundWordIds: [],
    score: 0,
    moves: 0,
    startedAt: 1,
    completedAt: null,
    revealedWords: false,
  };
}
