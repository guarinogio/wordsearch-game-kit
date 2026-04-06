export { createWordSearchGame } from './create-wordsearch-game';
export type { WordSearchGame } from './create-wordsearch-game';

export {
  buildLinearPath,
  cellsEqual,
  getDirectionBetweenCells,
  pathEquals,
  reversePath,
} from './geometry';

export { findPlacementMatch } from './matching';
export { createSnapshotFromState, applySnapshotToPuzzle } from './snapshot';
export { validatePuzzleDefinition } from './validation';
