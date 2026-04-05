import type { Cell, LayoutMetrics } from '@gioguarino/wordsearch-types';

export function getCellFromPoint(
  x: number,
  y: number,
  metrics: LayoutMetrics,
  size: number,
): Cell | null {
  const localX = x - metrics.boardX;
  const localY = y - metrics.boardY;

  if (localX < 0 || localY < 0) {
    return null;
  }

  if (localX >= metrics.boardSizePx || localY >= metrics.boardSizePx) {
    return null;
  }

  const col = Math.floor(localX / metrics.cellSizePx);
  const row = Math.floor(localY / metrics.cellSizePx);

  if (row < 0 || row >= size || col < 0 || col >= size) {
    return null;
  }

  return { row, col };
}
