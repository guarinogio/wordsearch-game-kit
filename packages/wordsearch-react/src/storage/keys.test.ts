import { describe, expect, it } from 'vitest';

import { buildWordSearchStorageKey } from './keys';

describe('buildWordSearchStorageKey', () => {
  it('uses explicit storageKey when provided', () => {
    expect(
      buildWordSearchStorageKey({
        puzzleId: 'p1',
        storageKey: 'custom:key',
      }),
    ).toBe('custom:key');
  });

  it('uses namespace and puzzle id when no explicit key is provided', () => {
    expect(
      buildWordSearchStorageKey({
        puzzleId: 'p1',
        namespace: 'daily',
      }),
    ).toBe('daily:p1');
  });

  it('falls back to default namespace', () => {
    expect(
      buildWordSearchStorageKey({
        puzzleId: 42,
      }),
    ).toBe('wordsearch:42');
  });
});
