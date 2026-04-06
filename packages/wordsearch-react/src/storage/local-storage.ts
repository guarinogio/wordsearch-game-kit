import type { SerializableGameSnapshot } from '@gioguarino/wordsearch-types';

type PersistedWordSearchRecord = {
  version: 1;
  savedAt: number;
  snapshot: SerializableGameSnapshot;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function readWordSearchSnapshot(
  key: string,
): SerializableGameSnapshot | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedWordSearchRecord;

    if (!parsed || parsed.version !== 1 || !parsed.snapshot) {
      return null;
    }

    return parsed.snapshot;
  } catch {
    return null;
  }
}

export function writeWordSearchSnapshot(
  key: string,
  snapshot: SerializableGameSnapshot,
): void {
  if (!isBrowser()) {
    return;
  }

  const record: PersistedWordSearchRecord = {
    version: 1,
    savedAt: Date.now(),
    snapshot,
  };

  window.localStorage.setItem(key, JSON.stringify(record));
}

export function clearWordSearchSnapshot(key: string): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(key);
}
