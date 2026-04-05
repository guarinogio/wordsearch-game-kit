import type {
  LayoutMetrics,
  LayoutMode,
  ResponsiveOptions,
  WordSearchPuzzle,
} from '@gioguarino/wordsearch-types';

const DEFAULT_MIN_CELL_SIZE = 28;
const DEFAULT_MAX_CELL_SIZE = 64;

function resolveLayoutMode(width: number): LayoutMode {
  if (width < 520) {
    return 'compact';
  }

  if (width < 980) {
    return 'comfortable';
  }

  return 'wide';
}

export function computeLayoutMetrics(
  containerWidth: number,
  containerHeight: number,
  puzzle: WordSearchPuzzle,
  responsive: ResponsiveOptions = {},
): LayoutMetrics {
  const minCellSize = responsive.minCellSize ?? DEFAULT_MIN_CELL_SIZE;
  const maxCellSize = responsive.maxCellSize ?? DEFAULT_MAX_CELL_SIZE;

  const horizontalPadding = containerWidth < 640 ? 16 : 24;
  const verticalPadding = containerHeight < 640 ? 16 : 24;

  const availableWidth = Math.max(0, containerWidth - horizontalPadding * 2);
  const availableHeight = Math.max(0, containerHeight - verticalPadding * 2);

  const boardSizePx = Math.max(0, Math.min(availableWidth, availableHeight));
  const rawCellSize = boardSizePx / puzzle.size;
  const cellSizePx = Math.max(minCellSize, Math.min(maxCellSize, rawCellSize));
  const resolvedBoardSize = cellSizePx * puzzle.size;

  const boardX = Math.floor((containerWidth - resolvedBoardSize) / 2);
  const boardY = Math.floor((containerHeight - resolvedBoardSize) / 2);

  return {
    viewportWidth: containerWidth,
    viewportHeight: containerHeight,
    boardSizePx: resolvedBoardSize,
    cellSizePx,
    boardX,
    boardY,
    mode: resolveLayoutMode(containerWidth),
  };
}
