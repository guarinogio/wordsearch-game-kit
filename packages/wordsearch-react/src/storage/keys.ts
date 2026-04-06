export type BuildWordSearchStorageKeyArgs = {
  namespace?: string;
  puzzleId: string | number;
  storageKey?: string;
};

const DEFAULT_NAMESPACE = 'wordsearch';

export function buildWordSearchStorageKey({
  namespace,
  puzzleId,
  storageKey,
}: BuildWordSearchStorageKeyArgs): string {
  if (storageKey && storageKey.trim()) {
    return storageKey;
  }

  const safeNamespace = namespace?.trim() || DEFAULT_NAMESPACE;
  return `${safeNamespace}:${String(puzzleId)}`;
}
