import type {
  FoundWordState,
  GameState,
  SerializableGameSnapshot,
  WordSearchPuzzle,
} from '@gioguarino/wordsearch-types';

export function createSnapshotFromState(state: GameState): SerializableGameSnapshot {
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
}

export function applySnapshotToPuzzle(
  puzzle: WordSearchPuzzle,
  snapshot: SerializableGameSnapshot,
): Pick<
  GameState,
  'foundWords' | 'foundWordIds' | 'revealedWords' | 'score' | 'moves' | 'status' | 'startedAt' | 'completedAt'
> {
  const foundWords: Record<string, FoundWordState> = {};

  for (const [index, wordId] of snapshot.foundWordIds.entries()) {
    const placement = puzzle.placements.find((item) => item.wordId === wordId);

    if (!placement) {
      continue;
    }

    foundWords[wordId] = {
      wordId,
      foundAtMove: index + 1,
      foundAtTimestamp: snapshot.completedAt ?? snapshot.startedAt ?? 0,
      path: placement.path,
      reverse: false,
    };
  }

  return {
    foundWords,
    foundWordIds: Object.keys(foundWords),
    revealedWords: snapshot.revealedWords,
    score: snapshot.score,
    moves: snapshot.moves,
    status: snapshot.status,
    startedAt: snapshot.startedAt,
    completedAt: snapshot.completedAt,
  };
}
