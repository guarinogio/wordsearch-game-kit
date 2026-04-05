import { describe, expect, it } from 'vitest';

import type { WordSearchPuzzle } from '@gioguarino/wordsearch-types';

import { createWordSearchGame } from './create-wordsearch-game';

const puzzle: WordSearchPuzzle = {
  id: 'demo-1',
  size: 4,
  topic: 'Demo',
  grid: [
    ['C', 'A', 'T', 'S'],
    ['X', 'X', 'X', 'X'],
    ['D', 'O', 'G', 'S'],
    ['X', 'X', 'X', 'X'],
  ],
  words: [
    { id: 'cat', label: 'Cat', value: 'CAT' },
    { id: 'dog', label: 'Dog', value: 'DOG' },
  ],
  placements: [
    {
      wordId: 'cat',
      label: 'Cat',
      value: 'CAT',
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
      wordId: 'dog',
      label: 'Dog',
      value: 'DOG',
      start: { row: 2, col: 0 },
      end: { row: 2, col: 2 },
      direction: 'E',
      path: [
        { row: 2, col: 0 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
      ],
    },
  ],
};

describe('createWordSearchGame', () => {
  it('finds a word in the forward direction', () => {
    const game = createWordSearchGame(puzzle);

    game.beginSelection({ row: 0, col: 0 });
    game.updateSelection({ row: 0, col: 2 });

    const result = game.commitSelection();

    expect(result.kind).toBe('match');
    expect(game.getState().foundWordIds).toEqual(['cat']);
    expect(game.getState().score).toBe(100);
  });

  it('finds a word in reverse when allowed', () => {
    const game = createWordSearchGame(puzzle);

    game.beginSelection({ row: 0, col: 2 });
    game.updateSelection({ row: 0, col: 0 });

    const result = game.commitSelection();

    expect(result.kind).toBe('match');
    if (result.kind === 'match') {
      expect(result.reverse).toBe(true);
    }
    expect(game.getState().foundWordIds).toEqual(['cat']);
  });

  it('returns duplicate for an already found word', () => {
    const game = createWordSearchGame(puzzle);

    game.beginSelection({ row: 0, col: 0 });
    game.updateSelection({ row: 0, col: 2 });
    game.commitSelection();

    game.beginSelection({ row: 0, col: 0 });
    game.updateSelection({ row: 0, col: 2 });

    const result = game.commitSelection();

    expect(result.kind).toBe('duplicate');
    expect(game.getState().score).toBe(100);
  });

  it('completes the puzzle and grants completion score', () => {
    const game = createWordSearchGame(puzzle);

    game.beginSelection({ row: 0, col: 0 });
    game.updateSelection({ row: 0, col: 2 });
    game.commitSelection();

    game.beginSelection({ row: 2, col: 0 });
    game.updateSelection({ row: 2, col: 2 });

    const result = game.commitSelection();

    expect(result.kind).toBe('match');
    expect(game.getState().status).toBe('completed');
    expect(game.getState().score).toBe(700);
  });

  it('hydrates from a snapshot', () => {
    const game = createWordSearchGame(puzzle);

    game.hydrate({
      puzzleId: 'demo-1',
      foundWordIds: ['cat'],
      revealedWords: true,
      score: 100,
      moves: 1,
      status: 'playing',
      startedAt: 1,
      completedAt: null,
    });

    expect(game.getState().foundWordIds).toEqual(['cat']);
    expect(game.getState().revealedWords).toBe(true);
    expect(game.getState().score).toBe(100);
  });
});
