import type { ShellDailySessionState } from './session-types';

type PersistedShellSessionRecord = {
  version: 1;
  savedAt: number;
  state: ShellDailySessionState;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function buildShellSessionStorageKey(sessionId: string): string {
  return `daily-wordsearch-shell:${sessionId}`;
}

export function readShellSessionState(sessionId: string): ShellDailySessionState | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(buildShellSessionStorageKey(sessionId));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as PersistedShellSessionRecord;

    if (!parsed || parsed.version !== 1 || !parsed.state) {
      return null;
    }

    return parsed.state;
  } catch {
    return null;
  }
}

export function writeShellSessionState(state: ShellDailySessionState): void {
  if (!isBrowser()) {
    return;
  }

  const record: PersistedShellSessionRecord = {
    version: 1,
    savedAt: Date.now(),
    state,
  };

  window.localStorage.setItem(
    buildShellSessionStorageKey(state.sessionId),
    JSON.stringify(record),
  );
}

export function clearShellSessionState(sessionId: string): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(buildShellSessionStorageKey(sessionId));
}
