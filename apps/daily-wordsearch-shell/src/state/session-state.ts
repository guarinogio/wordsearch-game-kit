import type {
  GameState,
  SerializableGameSnapshot,
  WordSearchPuzzle,
} from '@gioguarino/wordsearch-types';

import type {
  ShellDailySessionState,
  ShellPuzzleProgress,
  ShellPuzzleProgressPatch,
} from './session-types';

export function toPuzzleId(puzzle: WordSearchPuzzle): string {
  return String(puzzle.id);
}

export function createEmptyPuzzleProgress(puzzleId: string): ShellPuzzleProgress {
  return {
    puzzleId,
    foundWordIds: [],
    foundCount: 0,
    completed: false,
    revealedWords: false,
    completedAt: null,
    lastPlayedAt: null,
    snapshot: null,
  };
}

export function createInitialSessionState(
  sessionId: string,
  date: string,
  topic: string,
  puzzles: WordSearchPuzzle[],
): ShellDailySessionState {
  const firstPuzzleId = toPuzzleId(puzzles[0]!);

  return {
    sessionId,
    date,
    topic,
    activePuzzleId: firstPuzzleId,
    puzzles: Object.fromEntries(
      puzzles.map((puzzle) => {
        const puzzleId = toPuzzleId(puzzle);
        return [puzzleId, createEmptyPuzzleProgress(puzzleId)];
      }),
    ),
  };
}

export function mergeLoadedSessionState(
  baseState: ShellDailySessionState,
  loadedState: ShellDailySessionState | null,
): ShellDailySessionState {
  if (!loadedState || loadedState.sessionId !== baseState.sessionId) {
    return baseState;
  }

  const mergedPuzzles: ShellDailySessionState['puzzles'] = { ...baseState.puzzles };

  for (const [puzzleId, progress] of Object.entries(loadedState.puzzles)) {
    if (!mergedPuzzles[puzzleId]) {
      continue;
    }

    mergedPuzzles[puzzleId] = {
      ...mergedPuzzles[puzzleId],
      ...progress,
    };
  }

  return {
    ...baseState,
    activePuzzleId: mergedPuzzles[loadedState.activePuzzleId]
      ? loadedState.activePuzzleId
      : baseState.activePuzzleId,
    puzzles: mergedPuzzles,
  };
}

export function areStringArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((value, index) => value === b[index]);
}

export function setActivePuzzleIdInState(
  state: ShellDailySessionState,
  puzzleId: string,
): ShellDailySessionState {
  if (!state.puzzles[puzzleId] || state.activePuzzleId === puzzleId) {
    return state;
  }

  return {
    ...state,
    activePuzzleId: puzzleId,
  };
}

export function updatePuzzleProgressInState(
  state: ShellDailySessionState,
  puzzleId: string,
  patch: ShellPuzzleProgressPatch,
): ShellDailySessionState {
  const currentProgress = state.puzzles[puzzleId];

  if (!currentProgress) {
    return state;
  }

  return {
    ...state,
    puzzles: {
      ...state.puzzles,
      [puzzleId]: {
        ...currentProgress,
        ...patch,
      },
    },
  };
}

export function syncPuzzleFromGameStateInState(
  state: ShellDailySessionState,
  puzzleId: string,
  gameState: GameState,
  snapshot: SerializableGameSnapshot,
): ShellDailySessionState {
  const currentProgress = state.puzzles[puzzleId];

  if (!currentProgress) {
    return state;
  }

  const nextFoundWordIds = [...gameState.foundWordIds];
  const nextFoundCount = nextFoundWordIds.length;
  const nextCompleted = gameState.status === 'completed';
  const nextRevealedWords = gameState.revealedWords;
  const nextCompletedAt = gameState.completedAt;
  const nextSnapshot = snapshot;

  const same =
    areStringArraysEqual(currentProgress.foundWordIds, nextFoundWordIds) &&
    currentProgress.foundCount === nextFoundCount &&
    currentProgress.completed === nextCompleted &&
    currentProgress.revealedWords === nextRevealedWords &&
    currentProgress.completedAt === nextCompletedAt &&
    JSON.stringify(currentProgress.snapshot) === JSON.stringify(nextSnapshot);

  if (same) {
    return state;
  }

  return {
    ...state,
    puzzles: {
      ...state.puzzles,
      [puzzleId]: {
        ...currentProgress,
        foundWordIds: nextFoundWordIds,
        foundCount: nextFoundCount,
        completed: nextCompleted,
        revealedWords: nextRevealedWords,
        completedAt: nextCompletedAt,
        lastPlayedAt: Date.now(),
        snapshot: nextSnapshot,
      },
    },
  };
}
