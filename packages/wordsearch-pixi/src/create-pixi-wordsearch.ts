import { Application } from 'pixi.js';

import { createWordSearchGame } from '@gioguarino/wordsearch-core';

import type {
  LayoutMetrics,
  ResponsiveOptions,
  WordSearchPuzzle,
  WordSearchTheme,
} from '@gioguarino/wordsearch-types';

import { BoardRenderer } from './display/board-renderer';
import { computeLayoutMetrics } from './layout/compute-layout';
import { defaultWordSearchTheme } from './theme/default-theme';
import type { PixiWordSearchInstance, PixiWordSearchOptions } from './types';

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
    ...(responsive?.safeAreaInsets
      ? { safeAreaInsets: responsive.safeAreaInsets }
      : {}),
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

export async function createPixiWordSearch(
  options: PixiWordSearchOptions,
): Promise<PixiWordSearchInstance> {
  let puzzle = options.puzzle;
  const theme = mergeTheme(options.theme);
  const responsive = mergeResponsiveOptions(options.responsive);
  const game = options.game ?? createWordSearchGame(puzzle);

  const app = new Application();
  const boardRenderer = new BoardRenderer();

  let layoutMetrics: LayoutMetrics | null = null;

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
    boardRenderer.render(puzzle, theme, layoutMetrics);
  };

  const resize = (): void => {
    renderBoard();
  };

  const handleResize = (): void => {
    resize();
  };

  if (responsive.autoResize) {
    window.addEventListener('resize', handleResize);
  }

  renderBoard();

  if (options.autoStart ?? true) {
    game.start();
  }

  return {
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
      renderBoard();
    },

    destroy() {
      if (responsive.autoResize) {
        window.removeEventListener('resize', handleResize);
      }

      boardRenderer.destroy();
      app.destroy(true, {
        children: true,
      });
    },
  };
}
