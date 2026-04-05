import type {
  Cell,
  CreateWordSearchGameOptions,
  GameEvent,
  GameEventListener,
  GameState,
  ResolvedWordSearchRules,
  ResolvedWordSearchScoringConfig,
  SelectionResult,
  SerializableGameSnapshot,
  WordSearchPuzzle,
} from '@gioguarino/wordsearch-types';

import { buildLinearPath, getDirectionBetweenCells } from './geometry';
import { findPlacementMatch } from './matching';
import { applySnapshotToPuzzle, createSnapshotFromState } from './snapshot';
import { validatePuzzleDefinition } from './validation';

const DEFAULT_SCORING: ResolvedWordSearchScoringConfig = {
  pointsPerWord: 100,
  pointsOnComplete: 500,
};

const DEFAULT_RULES: ResolvedWordSearchRules = {
  allowReverseSelection: true,
  duplicateSelectionBehavior: 'emit-event',
  allowRevealWords: true,
};

export type WordSearchGame = {
  getState(): GameState;
  getSnapshot(): SerializableGameSnapshot;
  getResolvedRules(): ResolvedWordSearchRules;
  getResolvedScoring(): ResolvedWordSearchScoringConfig;
  start(): void;
  restart(): void;
  destroy(): void;
  beginSelection(cell: Cell): void;
  updateSelection(cell: Cell): void;
  commitSelection(): SelectionResult;
  cancelSelection(): void;
  revealWords(): void;
  hydrate(snapshot: SerializableGameSnapshot): void;
  subscribe(listener: GameEventListener): () => void;
};

function createInitialState(puzzle: WordSearchPuzzle): GameState {
  return {
    status: 'idle',
    puzzle,
    foundWords: {},
    foundWordIds: [],
    revealedWords: false,
    selection: null,
    moves: 0,
    score: 0,
    startedAt: null,
    completedAt: null,
  };
}

export function createWordSearchGame(
  puzzle: WordSearchPuzzle,
  options: CreateWordSearchGameOptions = {},
): WordSearchGame {
  validatePuzzleDefinition(puzzle);

  const scoring: ResolvedWordSearchScoringConfig = {
    ...DEFAULT_SCORING,
    ...options.scoring,
  };

  const rules: ResolvedWordSearchRules = {
    ...DEFAULT_RULES,
    ...options.rules,
  };

  const listeners = new Set<GameEventListener>();

  let state = createInitialState(puzzle);

  const emit = (event: GameEvent): void => {
    for (const listener of listeners) {
      listener(event);
    }
  };

  const ensureStarted = (): void => {
    if (state.status === 'idle') {
      const timestamp = Date.now();
      state = {
        ...state,
        status: 'playing',
        startedAt: state.startedAt ?? timestamp,
      };

      emit({
        type: 'game:started',
        timestamp,
      });
    }
  };

  const maybeCompleteGame = (): boolean => {
    const isComplete = state.foundWordIds.length === state.puzzle.words.length;

    if (!isComplete || state.status === 'completed') {
      return false;
    }

    const timestamp = Date.now();
    const nextScore = state.score + scoring.pointsOnComplete;

    state = {
      ...state,
      status: 'completed',
      score: nextScore,
      completedAt: timestamp,
    };

    emit({
      type: 'score:changed',
      score: nextScore,
      delta: scoring.pointsOnComplete,
      timestamp,
    });

    emit({
      type: 'game:completed',
      score: nextScore,
      foundWordIds: state.foundWordIds,
      timestamp,
    });

    return true;
  };

  return {
    getState() {
      return state;
    },

    getSnapshot() {
      return createSnapshotFromState(state);
    },

    getResolvedRules() {
      return rules;
    },

    getResolvedScoring() {
      return scoring;
    },

    start() {
      ensureStarted();
    },

    restart() {
      const timestamp = Date.now();
      state = createInitialState(puzzle);

      emit({
        type: 'game:restarted',
        timestamp,
      });
    },

    destroy() {
      listeners.clear();
    },

    beginSelection(cell) {
      ensureStarted();

      const timestamp = Date.now();

      state = {
        ...state,
        selection: {
          startCell: cell,
          currentCell: cell,
          direction: null,
          path: [cell],
        },
      };

      emit({
        type: 'selection:started',
        cell,
        timestamp,
      });
    },

    updateSelection(cell) {
      const selection = state.selection;

      if (!selection) {
        return;
      }

      const timestamp = Date.now();
      const nextDirection = getDirectionBetweenCells(selection.startCell, cell);
      const nextPath = buildLinearPath(selection.startCell, cell) ?? [selection.startCell];

      state = {
        ...state,
        selection: {
          ...selection,
          currentCell: cell,
          direction: nextDirection,
          path: nextPath,
        },
      };

      emit({
        type: 'selection:updated',
        path: nextPath,
        timestamp,
      });
    },

    commitSelection() {
      const timestamp = Date.now();
      const selection = state.selection;

      if (!selection) {
        return {
          kind: 'invalid',
          reason: 'empty-selection',
        };
      }

      const path = selection.path;

      emit({
        type: 'selection:committed',
        path,
        timestamp,
      });

      state = {
        ...state,
        selection: null,
      };

      if (path.length === 0) {
        return {
          kind: 'invalid',
          reason: 'empty-selection',
        };
      }

      const linearPath = buildLinearPath(path[0]!, path[path.length - 1]!);

      if (!linearPath) {
        return {
          kind: 'invalid',
          reason: 'non-linear-selection',
        };
      }

      const match = findPlacementMatch(state.puzzle, linearPath, rules.allowReverseSelection);

      if (match.kind === 'miss') {
        state = {
          ...state,
          moves: state.moves + 1,
        };

        return {
          kind: 'miss',
          path: linearPath,
        };
      }

      const { placement, reverse } = match;

      if (state.foundWords[placement.wordId]) {
        state = {
          ...state,
          moves: state.moves + 1,
        };

        if (rules.duplicateSelectionBehavior === 'emit-event') {
          emit({
            type: 'word:duplicate',
            wordId: placement.wordId,
            path: linearPath,
            timestamp,
          });
        }

        return {
          kind: 'duplicate',
          wordId: placement.wordId,
          path: linearPath,
        };
      }

      const nextScore = state.score + scoring.pointsPerWord;
      const nextMoves = state.moves + 1;
      const nextFoundWordIds = [...state.foundWordIds, placement.wordId];

      state = {
        ...state,
        status: 'playing',
        moves: nextMoves,
        score: nextScore,
        foundWordIds: nextFoundWordIds,
        foundWords: {
          ...state.foundWords,
          [placement.wordId]: {
            wordId: placement.wordId,
            foundAtMove: nextMoves,
            foundAtTimestamp: timestamp,
            path: placement.path,
            reverse,
          },
        },
      };

      emit({
        type: 'score:changed',
        score: nextScore,
        delta: scoring.pointsPerWord,
        timestamp,
      });

      emit({
        type: 'word:found',
        wordId: placement.wordId,
        reverse,
        path: placement.path,
        score: nextScore,
        delta: scoring.pointsPerWord,
        timestamp,
      });

      const completedPuzzle = maybeCompleteGame();

      return {
        kind: 'match',
        wordId: placement.wordId,
        reverse,
        path: placement.path,
        scoreDelta: completedPuzzle
          ? scoring.pointsPerWord + scoring.pointsOnComplete
          : scoring.pointsPerWord,
        completedPuzzle,
      };
    },

    cancelSelection() {
      if (!state.selection) {
        return;
      }

      const timestamp = Date.now();

      state = {
        ...state,
        selection: null,
      };

      emit({
        type: 'selection:cancelled',
        timestamp,
      });
    },

    revealWords() {
      if (!rules.allowRevealWords || state.revealedWords) {
        return;
      }

      const timestamp = Date.now();

      state = {
        ...state,
        revealedWords: true,
      };

      emit({
        type: 'words:revealed',
        timestamp,
      });
    },

    hydrate(snapshot) {
      if (snapshot.puzzleId !== puzzle.id) {
        throw new Error(
          `Snapshot puzzle mismatch: expected "${puzzle.id}", received "${snapshot.puzzleId}".`,
        );
      }

      const restored = applySnapshotToPuzzle(puzzle, snapshot);

      state = {
        ...createInitialState(puzzle),
        ...restored,
      };
    },

    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}
