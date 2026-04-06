import '@testing-library/jest-dom/vitest';

import { createRef } from 'react';
import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { GameState, SerializableGameSnapshot, WordSearchPuzzle } from '@gioguarino/wordsearch-types';

import { WordSearchBoard } from './word-search-board';
import type { WordSearchBoardHandle } from './types';
import { testPuzzle } from './test-utils';

const mocks = vi.hoisted(() => {
  const puzzle: WordSearchPuzzle = {
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

  const snapshot: SerializableGameSnapshot = {
    puzzleId: 'react-test-puzzle',
    status: 'playing',
    foundWordIds: [],
    score: 0,
    moves: 0,
    startedAt: 1,
    completedAt: null,
    revealedWords: false,
  };

  const gameState: GameState = {
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

  const destroyMock = vi.fn();
  const resizeMock = vi.fn();
  const resetViewMock = vi.fn();
  const setPuzzleMock = vi.fn();
  const hydrateMock = vi.fn();
  const restartMock = vi.fn();
  const startMock = vi.fn();
  const revealWordsMock = vi.fn();
  const subscribeMock = vi.fn(() => () => {});
  const getSnapshotMock = vi.fn(() => snapshot);
  const getStateMock = vi.fn(() => gameState);

  const instance = {
    destroy: destroyMock,
    resize: resizeMock,
    resetView: resetViewMock,
    setPuzzle: setPuzzleMock,
    getPuzzle: () => puzzle,
    getGame: () => ({
      hydrate: hydrateMock,
      restart: restartMock,
      start: startMock,
      revealWords: revealWordsMock,
      subscribe: subscribeMock,
      getSnapshot: getSnapshotMock,
      getState: getStateMock,
    }),
  };

  const createPixiWordSearchMock = vi.fn(() => Promise.resolve(instance));

  return {
    puzzle,
    gameState,
    instance,
    destroyMock,
    resizeMock,
    resetViewMock,
    setPuzzleMock,
    hydrateMock,
    restartMock,
    startMock,
    revealWordsMock,
    subscribeMock,
    getSnapshotMock,
    getStateMock,
    createPixiWordSearchMock,
  };
});

vi.mock('@gioguarino/wordsearch-pixi', () => ({
  createPixiWordSearch: mocks.createPixiWordSearchMock,
}));

describe('WordSearchBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a pixi instance on mount', async () => {
    render(<WordSearchBoard puzzle={testPuzzle} />);

    await waitFor(() => {
      expect(mocks.createPixiWordSearchMock).toHaveBeenCalledTimes(1);
    });

    expect(mocks.createPixiWordSearchMock.mock.calls[0]?.[0]).toMatchObject({
      puzzle: testPuzzle,
    });
  });

  it('calls onInstanceReady when the instance is ready', async () => {
    const onInstanceReady = vi.fn();

    render(
      <WordSearchBoard
        puzzle={testPuzzle}
        onInstanceReady={onInstanceReady}
      />,
    );

    await waitFor(() => {
      expect(onInstanceReady).toHaveBeenCalledWith(mocks.instance);
    });
  });

  it('destroys the instance on unmount', async () => {
    const rendered = render(<WordSearchBoard puzzle={testPuzzle} />);

    await waitFor(() => {
      expect(mocks.createPixiWordSearchMock).toHaveBeenCalledTimes(1);
    });

    rendered.unmount();

    expect(mocks.destroyMock).toHaveBeenCalledTimes(1);
  });

  it('exposes imperative handle actions', async () => {
    const ref = createRef<WordSearchBoardHandle>();

    render(<WordSearchBoard ref={ref} puzzle={testPuzzle} />);

    await waitFor(() => {
      expect(ref.current).not.toBeNull();
    });

    ref.current?.restart();
    ref.current?.revealWords();
    ref.current?.resize();
    ref.current?.resetView();

    expect(mocks.restartMock).toHaveBeenCalledTimes(1);
    expect(mocks.startMock).toHaveBeenCalledTimes(1);
    expect(mocks.revealWordsMock).toHaveBeenCalledTimes(1);
    expect(mocks.resizeMock).toHaveBeenCalledTimes(1);
    expect(mocks.resetViewMock).toHaveBeenCalledTimes(1);
  });

  it('returns current instance and game state through the handle', async () => {
    const ref = createRef<WordSearchBoardHandle>();

    render(<WordSearchBoard ref={ref} puzzle={testPuzzle} />);

    await waitFor(() => {
      expect(ref.current).not.toBeNull();
    });

    expect(ref.current?.getInstance()).toBe(mocks.instance);
    expect(ref.current?.getGameState()).toEqual(mocks.gameState);
  });
});
