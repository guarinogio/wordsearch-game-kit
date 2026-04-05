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
  subscribe(listener: GameEventListener): () => void;
};

export function createWordSearchGame(
  puzzle: WordSearchPuzzle,
  options: CreateWordSearchGameOptions = {},
): WordSearchGame {
  const scoring: ResolvedWordSearchScoringConfig = {
    ...DEFAULT_SCORING,
    ...options.scoring,
  };

  const rules: ResolvedWordSearchRules = {
    ...DEFAULT_RULES,
    ...options.rules,
  };

  const listeners = new Set<GameEventListener>();

  let state: GameState = {
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

  const emit = (event: GameEvent): void => {
    for (const listener of listeners) {
      listener(event);
    }
  };

  return {
    getState() {
      return state;
    },

    getSnapshot() {
      return {
        puzzleId: state.puzzle.id,
        foundWordIds: state.foundWordIds,
        revealedWords: state.revealedWords,
        score: state.score,
        moves: state.moves,
        status: state.status,
        startedAt: state.startedAt,
        completedAt: state.completedAt,
      };
    },

    getResolvedRules() {
      return rules;
    },

    getResolvedScoring() {
      return scoring;
    },

    start() {
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
    },

    restart() {
      const timestamp = Date.now();
      state = {
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
      emit({
        type: 'game:restarted',
        timestamp,
      });
    },

    destroy() {
      listeners.clear();
    },

    beginSelection(cell) {
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
      const timestamp = Date.now();
      const selection = state.selection;

      if (!selection) {
        return;
      }

      const nextPath = [selection.startCell, cell];

      state = {
        ...state,
        selection: {
          ...selection,
          currentCell: cell,
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
      const path = state.selection?.path ?? [];

      emit({
        type: 'selection:committed',
        path,
        timestamp,
      });

      state = {
        ...state,
        selection: null,
      };

      return {
        kind: 'invalid',
        reason: 'empty-selection',
      };
    },

    cancelSelection() {
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
      if (!rules.allowRevealWords) {
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

    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
