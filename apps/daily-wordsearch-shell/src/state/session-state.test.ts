import { describe, expect, it, vi } from 'vitest';

import type {
  GameState,
  SerializableGameSnapshot,
  WordSearchPuzzle,
} from '@gioguarino/wordsearch-types';

import {
  createInitialSessionState,
  mergeLoadedSessionState,
  setActivePuzzleIdInState,
  syncPuzzleFromGameStateInState,
} from './session-state';

const puzzles: WordSearchPuzzle[] = [
  {
    id: 'p1',
    size: 4,
    topic: 'Test',
    grid: [
      ['A', 'B', 'C', 'D'],
      ['E', 'F', 'G', 'H'],
      ['I', 'J', 'K', 'L'],
      ['M', 'N', 'O', 'P'],
    ],
    words: [{ id: 'w1', label: 'AB', value: 'AB' }],
    placements: [
      {
        wordId: 'w1',
        label: 'AB',
        value: 'AB',
        start: { row: 0, col: 0 },
        end: { row: 0, col: 1 },
        direction: 'E',
        path: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
        ],
      },
    ],
  },
  {
    id: 'p2',
    size: 4,
    topic: 'Test',
    grid: [
      ['Q', 'R', 'S', 'T'],
      ['U', 'V', 'W', 'X'],
      ['Y', 'Z', 'A', 'B'],
      ['C', 'D', 'E', 'F'],
    ],
    words: [{ id: 'w2', label: 'QR', value: 'QR' }],
    placements: [
      {
        wordId: 'w2',
        label: 'QR',
        value: 'QR',
        start: { row: 0, col: 0 },
        end: { row: 0, col: 1 },
        direction: 'E',
        path: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
        ],
      },
    ],
  },
];

function createGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    puzzle: puzzles[0]!,
    status: 'playing',
    selection: null,
    foundWords: {},
    foundWordIds: [],
    score: 0,
    moves: 0,
    startedAt: 1,
    completedAt: null,
    revealedWords: false,
    ...overrides,
  };
}

function createSnapshot(
  puzzleId: string,
  foundWordIds: string[] = [],
): SerializableGameSnapshot {
  return {
    puzzleId,
    status: foundWordIds.length > 0 ? 'completed' : 'playing',
    foundWordIds,
    score: foundWordIds.length * 100,
    moves: foundWordIds.length,
    startedAt: 1,
    completedAt: foundWordIds.length > 0 ? 10 : null,
    revealedWords: false,
  };
}

describe('session-state', () => {
  it('creates initial session state', () => {
    const state = createInitialSessionState('session-1', '2026-04-05', 'Coffee', puzzles);

    expect(state.sessionId).toBe('session-1');
    expect(state.activePuzzleId).toBe('p1');
    expect(Object.keys(state.puzzles)).toEqual(['p1', 'p2']);
    expect(state.puzzles.p1?.foundCount).toBe(0);
  });

  it('merges loaded state without losing new puzzles', () => {
    const base = createInitialSessionState('session-1', '2026-04-05', 'Coffee', puzzles);
    const loaded = {
      ...base,
      activePuzzleId: 'p2',
      puzzles: {
        p1: {
          ...base.puzzles.p1!,
          foundWordIds: ['w1'],
          foundCount: 1,
        },
      },
    };

    const merged = mergeLoadedSessionState(base, loaded);

    expect(merged.activePuzzleId).toBe('p2');
    expect(merged.puzzles.p1?.foundCount).toBe(1);
    expect(merged.puzzles.p2?.foundCount).toBe(0);
  });

  it('changes active puzzle only when the id exists', () => {
    const base = createInitialSessionState('session-1', '2026-04-05', 'Coffee', puzzles);

    const changed = setActivePuzzleIdInState(base, 'p2');
    expect(changed.activePuzzleId).toBe('p2');

    const unchanged = setActivePuzzleIdInState(base, 'missing');
    expect(unchanged).toBe(base);
  });

  it('syncs game state into the correct puzzle only', () => {
    vi.spyOn(Date, 'now').mockReturnValue(12345);

    const base = createInitialSessionState('session-1', '2026-04-05', 'Coffee', puzzles);
    const gameState = createGameState({
      foundWordIds: ['w1'],
      status: 'completed',
      completedAt: 999,
    });
    const snapshot = createSnapshot('p1', ['w1']);

    const next = syncPuzzleFromGameStateInState(base, 'p1', gameState, snapshot);

    expect(next.puzzles.p1?.foundCount).toBe(1);
    expect(next.puzzles.p1?.completed).toBe(true);
    expect(next.puzzles.p1?.lastPlayedAt).toBe(12345);

    expect(next.puzzles.p2?.foundCount).toBe(0);
    expect(next.puzzles.p2?.completed).toBe(false);

    vi.restoreAllMocks();
  });

  it('does not create a new state when nothing meaningful changed', () => {
    const base = createInitialSessionState('session-1', '2026-04-05', 'Coffee', puzzles);
    const gameState = createGameState({
      foundWordIds: [],
      status: 'playing',
      completedAt: null,
      revealedWords: false,
    });
    const snapshot = createSnapshot('p1', []);

    const next = syncPuzzleFromGameStateInState(base, 'p1', gameState, snapshot);
    const nextAgain = syncPuzzleFromGameStateInState(next, 'p1', gameState, snapshot);

    expect(nextAgain).toBe(next);
  });
});
