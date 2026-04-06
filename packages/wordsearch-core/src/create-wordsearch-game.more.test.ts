import { describe, expect, it } from 'vitest';

import type { SerializableGameSnapshot, WordSearchPuzzle } from '@gioguarino/wordsearch-types';

import { createWordSearchGame } from './create-wordsearch-game';

const puzzle: WordSearchPuzzle = {
  id: 'puzzle-extra',
  size: 5,
  topic: 'Extra',
  grid: [
    ['C', 'U', 'P', 'X', 'X'],
    ['X', 'X', 'X', 'X', 'X'],
    ['M', 'U', 'G', 'X', 'X'],
    ['X', 'X', 'X', 'X', 'X'],
    ['T', 'E', 'A', 'X', 'X'],
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
      start: { row: 4, col: 0 },
      end: { row: 4, col: 2 },
      direction: 'E',
      path: [
        { row: 4, col: 0 },
        { row: 4, col: 1 },
        { row: 4, col: 2 },
      ],
    },
  ],
};

function solveWord(
  game: ReturnType<typeof createWordSearchGame>,
  start: { row: number; col: number },
  end: { row: number; col: number },
): void {
  game.beginSelection(start);
  game.updateSelection(end);
  game.commitSelection();
}

describe('createWordSearchGame edge cases', () => {
  it('keeps state stable when committing without a valid selection', () => {
    const game = createWordSearchGame(puzzle);
    game.start();

    const before = game.getState();

    game.commitSelection();

    const after = game.getState();

    expect(after.foundWordIds).toEqual(before.foundWordIds);
    expect(after.selection).toBeNull();
    expect(after.status).toBe('playing');
  });

  it('cancels an active selection', () => {
    const game = createWordSearchGame(puzzle);
    game.start();

    game.beginSelection({ row: 0, col: 0 });
    game.updateSelection({ row: 0, col: 2 });

    expect(game.getState().selection).not.toBeNull();

    game.cancelSelection();

    expect(game.getState().selection).toBeNull();
  });

  it('can restart after completion and clear found words', () => {
    const game = createWordSearchGame(puzzle);
    game.start();

    solveWord(game, { row: 0, col: 0 }, { row: 0, col: 2 });
    solveWord(game, { row: 2, col: 0 }, { row: 2, col: 2 });
    solveWord(game, { row: 4, col: 0 }, { row: 4, col: 2 });

    expect(game.getState().status).toBe('completed');
    expect(game.getState().foundWordIds).toHaveLength(3);

    game.restart();

    const restarted = game.getState();

    expect(restarted.status).toBe('idle');
    expect(restarted.foundWordIds).toEqual([]);
    expect(restarted.selection).toBeNull();
    expect(restarted.completedAt).toBeNull();
    expect(restarted.revealedWords).toBe(false);
  });

  it('can hydrate and continue playing remaining words', () => {
    const game = createWordSearchGame(puzzle);
    game.start();

    const snapshot: SerializableGameSnapshot = {
      puzzleId: 'puzzle-extra',
      status: 'playing',
      foundWordIds: ['cup'],
      score: 100,
      moves: 1,
      startedAt: 1,
      completedAt: null,
      revealedWords: false,
    };

    game.hydrate(snapshot);

    expect(game.getState().foundWordIds).toEqual(['cup']);

    solveWord(game, { row: 2, col: 0 }, { row: 2, col: 2 });
    solveWord(game, { row: 4, col: 0 }, { row: 4, col: 2 });

    expect(game.getState().status).toBe('completed');
    expect(game.getState().foundWordIds).toEqual(['cup', 'mug', 'tea']);
  });

  it('throws on snapshot puzzle mismatch', () => {
    const game = createWordSearchGame(puzzle);

    const snapshot: SerializableGameSnapshot = {
      puzzleId: 'other-puzzle',
      status: 'playing',
      foundWordIds: [],
      score: 0,
      moves: 0,
      startedAt: 1,
      completedAt: null,
      revealedWords: false,
    };

    expect(() => game.hydrate(snapshot)).toThrow(/Snapshot puzzle mismatch/);
  });

  it('revealing words marks the puzzle as revealed without fabricating found words', () => {
    const game = createWordSearchGame(puzzle);
    game.start();

    game.revealWords();

    const state = game.getState();

    expect(state.revealedWords).toBe(true);
    expect(state.foundWordIds).toEqual([]);
  });
});
