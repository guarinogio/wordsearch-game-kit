import type { Cell, Direction } from '@gioguarino/wordsearch-types';

type DirectionVector = {
  direction: Direction;
  rowDelta: number;
  colDelta: number;
};

const DIRECTION_VECTORS: DirectionVector[] = [
  { direction: 'N', rowDelta: -1, colDelta: 0 },
  { direction: 'S', rowDelta: 1, colDelta: 0 },
  { direction: 'E', rowDelta: 0, colDelta: 1 },
  { direction: 'W', rowDelta: 0, colDelta: -1 },
  { direction: 'NE', rowDelta: -1, colDelta: 1 },
  { direction: 'NW', rowDelta: -1, colDelta: -1 },
  { direction: 'SE', rowDelta: 1, colDelta: 1 },
  { direction: 'SW', rowDelta: 1, colDelta: -1 },
];

export function cellsEqual(a: Cell, b: Cell): boolean {
  return a.row === b.row && a.col === b.col;
}

export function reversePath(path: Cell[]): Cell[] {
  return [...path].reverse();
}

export function getDirectionBetweenCells(start: Cell, end: Cell): Direction | null {
  const rowDiff = end.row - start.row;
  const colDiff = end.col - start.col;

  if (rowDiff === 0 && colDiff === 0) {
    return null;
  }

  const absRow = Math.abs(rowDiff);
  const absCol = Math.abs(colDiff);

  if (!(rowDiff === 0 || colDiff === 0 || absRow === absCol)) {
    return null;
  }

  const normalizedRow = rowDiff === 0 ? 0 : rowDiff / absRow;
  const normalizedCol = colDiff === 0 ? 0 : colDiff / absCol;

  const match = DIRECTION_VECTORS.find(
    (entry) => entry.rowDelta === normalizedRow && entry.colDelta === normalizedCol,
  );

  return match?.direction ?? null;
}

export function buildLinearPath(start: Cell, end: Cell): Cell[] | null {
  const direction = getDirectionBetweenCells(start, end);

  if (!direction) {
    return null;
  }

  const rowStep = Math.sign(end.row - start.row);
  const colStep = Math.sign(end.col - start.col);
  const length = Math.max(Math.abs(end.row - start.row), Math.abs(end.col - start.col));

  const path: Cell[] = [];

  for (let index = 0; index <= length; index += 1) {
    path.push({
      row: start.row + rowStep * index,
      col: start.col + colStep * index,
    });
  }

  return path;
}

export function pathEquals(a: Cell[], b: Cell[]): boolean {
  if (a.length !== b.length) {
    return false;
  }

  return a.every((cell, index) => cellsEqual(cell, b[index]!));
}
