import type { Cell, WordSearchPlacement, WordSearchPuzzle } from '@gioguarino/wordsearch-types';

function isInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value);
}

function isInBounds(cell: Cell, size: number): boolean {
  return cell.row >= 0 && cell.row < size && cell.col >= 0 && cell.col < size;
}

function validateGrid(puzzle: WordSearchPuzzle): void {
  if (puzzle.grid.length !== puzzle.size) {
    throw new Error(
      `Invalid puzzle grid: expected ${puzzle.size} rows, received ${puzzle.grid.length}.`,
    );
  }

  for (const [rowIndex, row] of puzzle.grid.entries()) {
    if (row.length !== puzzle.size) {
      throw new Error(
        `Invalid puzzle grid: row ${rowIndex} expected ${puzzle.size} columns, received ${row.length}.`,
      );
    }

    for (const [colIndex, value] of row.entries()) {
      if (typeof value !== 'string' || value.length !== 1) {
        throw new Error(
          `Invalid puzzle grid: cell (${rowIndex}, ${colIndex}) must be a single-character string.`,
        );
      }
    }
  }
}

function validateWords(puzzle: WordSearchPuzzle): void {
  const seenIds = new Set<string>();

  for (const word of puzzle.words) {
    if (!word.id.trim()) {
      throw new Error('Invalid puzzle words: every word must have a non-empty id.');
    }

    if (seenIds.has(word.id)) {
      throw new Error(`Invalid puzzle words: duplicated word id "${word.id}".`);
    }

    seenIds.add(word.id);

    if (!word.label.trim()) {
      throw new Error(`Invalid puzzle words: word "${word.id}" must have a non-empty label.`);
    }

    if (!word.value.trim()) {
      throw new Error(`Invalid puzzle words: word "${word.id}" must have a non-empty value.`);
    }
  }
}

function validatePlacementPath(
  placement: WordSearchPlacement,
  puzzle: WordSearchPuzzle,
  wordIds: Set<string>,
): void {
  if (!wordIds.has(placement.wordId)) {
    throw new Error(
      `Invalid placement: wordId "${placement.wordId}" does not exist in puzzle words.`,
    );
  }

  if (placement.path.length === 0) {
    throw new Error(`Invalid placement for "${placement.wordId}": path must not be empty.`);
  }

  for (const [index, cell] of placement.path.entries()) {
    if (!isInteger(cell.row) || !isInteger(cell.col)) {
      throw new Error(
        `Invalid placement for "${placement.wordId}": path cell ${index} must contain integer row/col values.`,
      );
    }

    if (!isInBounds(cell, puzzle.size)) {
      throw new Error(
        `Invalid placement for "${placement.wordId}": path cell ${index} is out of bounds.`,
      );
    }
  }

  const first = placement.path.at(0);
  const last = placement.path.at(-1);

  if (!first || !last) {
    throw new Error(`Invalid placement for "${placement.wordId}": path must not be empty.`);
  }

  if (first.row !== placement.start.row || first.col !== placement.start.col) {
    throw new Error(
      `Invalid placement for "${placement.wordId}": start does not match first path cell.`,
    );
  }

  if (last.row !== placement.end.row || last.col !== placement.end.col) {
    throw new Error(
      `Invalid placement for "${placement.wordId}": end does not match last path cell.`,
    );
  }
}

export function validatePuzzleDefinition(puzzle: WordSearchPuzzle): void {
  if (!isInteger(puzzle.size) || puzzle.size <= 0) {
    throw new Error(`Invalid puzzle size: expected positive integer, received ${puzzle.size}.`);
  }

  validateGrid(puzzle);
  validateWords(puzzle);

  const wordIds = new Set(puzzle.words.map((word) => word.id));

  for (const placement of puzzle.placements) {
    validatePlacementPath(placement, puzzle, wordIds);
  }
}
