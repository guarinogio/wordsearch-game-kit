import { Application } from 'pixi.js';

import { createWordSearchGame } from '@gioguarino/wordsearch-core';

import type {
  Cell,
  GameEvent,
  LayoutMetrics,
  ResponsiveOptions,
  WordSearchPuzzle,
  WordSearchTheme,
} from '@gioguarino/wordsearch-types';

import { BoardRenderer } from './display/board-renderer';
import { createPointerController } from './interaction/pointer-controller';
import { getCellFromPoint } from './interaction/hit-testing';
import { computeLayoutMetrics } from './layout/compute-layout';
import { defaultWordSearchTheme } from './theme/default-theme';
import type {
  PixiWordSearchCallbacks,
  PixiWordSearchInstance,
  PixiWordSearchOptions,
} from './types';

function mergeResponsiveOptions(
  responsive: ResponsiveOptions | undefined,
): ResponsiveOptions {
  return {
    autoResize: responsive?.autoResize ?? true,
    mode: responsive?.mode ?? 'board-only',
    minCellSize: responsive?.minCellSize ?? 28,
    maxCellSize: responsive?.maxCellSize ?? 64,
    allowZoom: responsive?.allowZoom ?? false,
    allowPan: responsive?.allowPan ?? false,
    hitSlop: responsive?.hitSlop ?? 10,
    ...(responsive?.safeAreaInsets ? { safeAreaInsets: responsive.safeAreaInsets } : {}),
    ...(responsive?.responsiveBreakpoints
      ? { responsiveBreakpoints: responsive.responsiveBreakpoints }
      : {}),
  };
}

function mergeTheme(theme: Partial<WordSearchTheme> | undefined): WordSearchTheme {
  return {
    ...defaultWordSearchTheme,
    ...theme,
    colors: {
      ...defaultWordSearchTheme.colors,
      ...theme?.colors,
    },
    cell: {
      ...defaultWordSearchTheme.cell,
      ...theme?.cell,
    },
    animation: {
      ...defaultWordSearchTheme.animation,
      ...theme?.animation,
    },
  };
}

function fanoutCallbacks(
  callbacks: PixiWordSearchCallbacks | undefined,
  event: GameEvent,
): void {
  callbacks?.onEvent?.(event);

  switch (event.type) {
    case 'selection:started':
      callbacks?.onSelectionStart?.(event);
      break;
    case 'selection:updated':
      callbacks?.onSelectionChange?.(event);
      break;
    case 'selection:committed':
      callbacks?.onSelectionCommit?.(event);
      break;
    case 'word:found':
      callbacks?.onWordFound?.(event);
      break;
    case 'word:duplicate':
      callbacks?.onWordDuplicate?.(event);
      break;
    case 'words:revealed':
      callbacks?.onWordsRevealed?.(event);
      break;
    case 'game:completed':
      callbacks?.onComplete?.(event);
      break;
    default:
      break;
  }
}

export async function createPixiWordSearch(
  options: PixiWordSearchOptions,
): Promise<PixiWordSearchInstance> {
  let puzzle = options.puzzle;
  const theme = mergeTheme(options.theme);
  const responsive = mergeResponsiveOptions(options.responsive);
  const callbacks = options.callbacks;
  let game = options.game ?? createWordSearchGame(puzzle);

  const app = new Application();
  const boardRenderer = new BoardRenderer();

  let layoutMetrics: LayoutMetrics | null = null;
  let unsubscribeGame: (() => void) | null = null;
  let pointerController: { destroy: () => void } | null = null;
  let feedbackTimeoutId: number | null = null;

  const clearFeedbackLater = (): void => {
    if (feedbackTimeoutId !== null) {
      window.clearTimeout(feedbackTimeoutId);
    }

    feedbackTimeoutId = window.setTimeout(() => {
      boardRenderer.clearFeedback();
      feedbackTimeoutId = null;
    }, theme.reducedMotion ? 120 : 320);
  };

  const syncVisualState = (): void => {
    if (!layoutMetrics) {
      return;
    }

    const state = game.getState();
    const foundPaths = Object.values(state.foundWords).map((item) => item.path);

    if (state.revealedWords) {
      const revealPaths = state.puzzle.placements.map((placement) => placement.path);
      boardRenderer.renderReveal(revealPaths, layoutMetrics, theme);
    } else {
      boardRenderer.clearReveal();
    }

    boardRenderer.renderFoundWords(foundPaths, layoutMetrics, theme);

    const selectionPath = state.selection?.path ?? [];
    boardRenderer.renderSelection(selectionPath, layoutMetrics, theme);
  };

  await app.init({
    backgroundAlpha: 0,
    antialias: true,
    autoDensity: true,
    resizeTo: options.container,
  });

  options.container.innerHTML = '';
  options.container.appendChild(app.canvas);

  app.stage.addChild(boardRenderer.root);

  const renderBoard = (): void => {
    const width = options.container.clientWidth;
    const height = options.container.clientHeight;

    if (width <= 0 || height <= 0) {
      return;
    }

    layoutMetrics = computeLayoutMetrics(width, height, puzzle, responsive);
    boardRenderer.renderBase(puzzle, theme, layoutMetrics);
    syncVisualState();
  };

  const resize = (): void => {
    renderBoard();
  };

  const handleResize = (): void => {
    resize();
  };

  const bindGameEvents = (): void => {
    unsubscribeGame?.();

    unsubscribeGame = game.subscribe((event) => {
      if (
        layoutMetrics &&
        event.type === 'word:duplicate'
      ) {
        boardRenderer.renderFeedback([event.path], layoutMetrics, theme, 'duplicate');
        clearFeedbackLater();
      }

      fanoutCallbacks(callbacks, event);
      syncVisualState();
    });
  };

  const getCellFromClientPoint = (clientX: number, clientY: number): Cell | null => {
    if (!layoutMetrics) {
      return null;
    }

    const rect = app.canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    return getCellFromPoint(x, y, layoutMetrics, puzzle.size);
  };

  const bindPointerController = (): void => {
    pointerController?.destroy();

    pointerController = createPointerController({
      element: app.canvas,
      getCellFromClientPoint,
      onSelectionStart(cell) {
        game.beginSelection(cell);
      },
      onSelectionMove(cell) {
        game.updateSelection(cell);
      },
      onSelectionEnd() {
        const result = game.commitSelection();

        if (result.kind === 'miss' && layoutMetrics) {
          boardRenderer.renderFeedback([result.path], layoutMetrics, theme, 'miss');
          clearFeedbackLater();
          callbacks?.onMissSelection?.(result.path);
        }
      },
      onSelectionCancel() {
        game.cancelSelection();
      },
    });
  };

  if (responsive.autoResize) {
    window.addEventListener('resize', handleResize);
  }

  bindGameEvents();
  bindPointerController();
  renderBoard();

  if (options.autoStart ?? true) {
    game.start();
  }

  const instance: PixiWordSearchInstance = {
    getGame() {
      return game;
    },

    getPuzzle() {
      return puzzle;
    },

    getTheme() {
      return theme;
    },

    getLayoutMetrics() {
      return layoutMetrics;
    },

    resize() {
      resize();
    },

    setPuzzle(nextPuzzle: WordSearchPuzzle) {
      puzzle = nextPuzzle;
      game = createWordSearchGame(nextPuzzle);

      boardRenderer.clearFeedback();
      boardRenderer.clearReveal();
      boardRenderer.clearFoundWords();
      boardRenderer.clearSelection();

      bindGameEvents();
      bindPointerController();
      renderBoard();
      game.start();
    },

    destroy() {
      unsubscribeGame?.();
      pointerController?.destroy();

      if (feedbackTimeoutId !== null) {
        window.clearTimeout(feedbackTimeoutId);
      }

      if (responsive.autoResize) {
        window.removeEventListener('resize', handleResize);
      }

      boardRenderer.destroy();
      app.destroy(true, {
        children: true,
      });
    },
  };

  callbacks?.onReady?.(instance);

  return instance;
}
