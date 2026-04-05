import type { Cell, WordSearchPlacement, WordSearchPuzzle } from '@gioguarino/wordsearch-types';

import { pathEquals, reversePath } from './geometry';

export type PlacementMatch =
  | {
      kind: 'match';
      placement: WordSearchPlacement;
      reverse: boolean;
    }
  | {
      kind: 'miss';
    };

export function findPlacementMatch(
  puzzle: WordSearchPuzzle,
  candidatePath: Cell[],
  allowReverseSelection: boolean,
): PlacementMatch {
  for (const placement of puzzle.placements) {
    if (pathEquals(placement.path, candidatePath)) {
      return {
        kind: 'match',
        placement,
        reverse: false,
      };
    }

    if (allowReverseSelection && pathEquals(reversePath(placement.path), candidatePath)) {
      return {
        kind: 'match',
        placement,
        reverse: true,
      };
    }
  }

  return {
    kind: 'miss',
  };
}
