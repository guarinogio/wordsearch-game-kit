import { useEffect, useMemo } from 'react';

import type { PixiWordSearchInstance } from '@gioguarino/wordsearch-pixi';
import type { WordSearchPuzzle } from '@gioguarino/wordsearch-types';

import { buildWordSearchStorageKey } from '../storage/keys';
import {
  clearWordSearchSnapshot,
  readWordSearchSnapshot,
  writeWordSearchSnapshot,
} from '../storage/local-storage';

export type UsePersistentWordSearchArgs = {
  instance: PixiWordSearchInstance | null;
  puzzle: WordSearchPuzzle;
  enabled?: boolean;
  namespace?: string;
  storageKey?: string;
};

export type UsePersistentWordSearchResult = {
  resolvedStorageKey: string;
  clearPersistedState: () => void;
};

export function usePersistentWordSearch({
  instance,
  puzzle,
  enabled = true,
  namespace,
  storageKey,
}: UsePersistentWordSearchArgs): UsePersistentWordSearchResult {
  const resolvedStorageKey = useMemo(() => {
    return buildWordSearchStorageKey({
      puzzleId: puzzle.id,
      ...(namespace ? { namespace } : {}),
      ...(storageKey ? { storageKey } : {}),
    });
  }, [namespace, puzzle.id, storageKey]);

  useEffect(() => {
    if (!enabled || !instance) {
      return;
    }

    const game = instance.getGame();
    const snapshot = readWordSearchSnapshot(resolvedStorageKey);

    if (snapshot && snapshot.puzzleId === puzzle.id) {
      game.hydrate(snapshot);
    }

    const unsubscribe = game.subscribe(() => {
      writeWordSearchSnapshot(resolvedStorageKey, game.getSnapshot());
    });

    writeWordSearchSnapshot(resolvedStorageKey, game.getSnapshot());

    return unsubscribe;
  }, [enabled, instance, puzzle.id, resolvedStorageKey]);

  return {
    resolvedStorageKey,
    clearPersistedState() {
      clearWordSearchSnapshot(resolvedStorageKey);
    },
  };
}
