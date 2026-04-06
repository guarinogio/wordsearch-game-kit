import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  GameState,
  SerializableGameSnapshot,
  WordSearchPuzzle,
} from '@gioguarino/wordsearch-types';

import {
  clearShellSessionState,
  readShellSessionState,
  writeShellSessionState,
} from './session-storage';
import {
  createEmptyPuzzleProgress,
  createInitialSessionState,
  mergeLoadedSessionState,
  setActivePuzzleIdInState,
  syncPuzzleFromGameStateInState,
  updatePuzzleProgressInState,
} from './session-state';
import type {
  ShellDailySessionState,
  ShellPuzzleProgress,
  ShellPuzzleProgressPatch,
} from './session-types';

type UseDailySessionStoreArgs = {
  sessionId: string;
  date: string;
  topic: string;
  puzzles: WordSearchPuzzle[];
};

type UseDailySessionStoreResult = {
  state: ShellDailySessionState;
  activePuzzleProgress: ShellPuzzleProgress;
  setActivePuzzleId: (puzzleId: string) => void;
  updatePuzzleProgress: (puzzleId: string, patch: ShellPuzzleProgressPatch) => void;
  syncPuzzleFromGameState: (
    puzzleId: string,
    gameState: GameState,
    snapshot: SerializableGameSnapshot,
  ) => void;
  clearSessionProgress: () => void;
};

export function useDailySessionStore({
  sessionId,
  date,
  topic,
  puzzles,
}: UseDailySessionStoreArgs): UseDailySessionStoreResult {
  const baseState = useMemo(
    () => createInitialSessionState(sessionId, date, topic, puzzles),
    [date, puzzles, sessionId, topic],
  );

  const [state, setState] = useState<ShellDailySessionState>(() =>
    mergeLoadedSessionState(baseState, readShellSessionState(sessionId)),
  );

  useEffect(() => {
    setState((current) => mergeLoadedSessionState(baseState, current));
  }, [baseState]);

  useEffect(() => {
    writeShellSessionState(state);
  }, [state]);

  const setActivePuzzleId = useCallback((puzzleId: string) => {
    setState((current) => setActivePuzzleIdInState(current, puzzleId));
  }, []);

  const updatePuzzleProgress = useCallback(
    (puzzleId: string, patch: ShellPuzzleProgressPatch) => {
      setState((current) => updatePuzzleProgressInState(current, puzzleId, patch));
    },
    [],
  );

  const syncPuzzleFromGameState = useCallback(
    (
      puzzleId: string,
      gameState: GameState,
      snapshot: SerializableGameSnapshot,
    ) => {
      setState((current) =>
        syncPuzzleFromGameStateInState(current, puzzleId, gameState, snapshot),
      );
    },
    [],
  );

  const clearSessionProgress = useCallback(() => {
    clearShellSessionState(sessionId);
    setState(baseState);
  }, [baseState, sessionId]);

  const activePuzzleProgress =
    state.puzzles[state.activePuzzleId] ?? createEmptyPuzzleProgress(state.activePuzzleId);

  return {
    state,
    activePuzzleProgress,
    setActivePuzzleId,
    updatePuzzleProgress,
    syncPuzzleFromGameState,
    clearSessionProgress,
  };
}
