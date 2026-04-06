import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SerializableGameSnapshot } from '@gioguarino/wordsearch-types';

import {
  clearWordSearchSnapshot,
  readWordSearchSnapshot,
  writeWordSearchSnapshot,
} from './local-storage';

const snapshot: SerializableGameSnapshot = {
  puzzleId: 'p1',
  status: 'playing',
  foundWordIds: ['cup'],
  score: 100,
  moves: 1,
  startedAt: 1,
  completedAt: null,
  revealedWords: false,
};

describe('local storage helpers', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();

    vi.stubGlobal('window', {
      localStorage: {
        getItem(key: string) {
          return storage.get(key) ?? null;
        },
        setItem(key: string, value: string) {
          storage.set(key, value);
        },
        removeItem(key: string) {
          storage.delete(key);
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('writes and reads snapshots', () => {
    writeWordSearchSnapshot('k1', snapshot);

    expect(readWordSearchSnapshot('k1')).toEqual(snapshot);
  });

  it('returns null for missing entries', () => {
    expect(readWordSearchSnapshot('missing')).toBeNull();
  });

  it('clears a stored snapshot', () => {
    writeWordSearchSnapshot('k1', snapshot);
    clearWordSearchSnapshot('k1');

    expect(readWordSearchSnapshot('k1')).toBeNull();
  });
});
