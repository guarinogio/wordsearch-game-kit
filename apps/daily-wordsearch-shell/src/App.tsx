import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
  ResponsiveOptions,
  WordDuplicateEvent,
  WordFoundEvent,
} from '@gioguarino/wordsearch-types';
import type { PixiWordSearchInstance } from '@gioguarino/wordsearch-pixi';

import { WordSearchBoard } from '@gioguarino/wordsearch-react';

import { dailySession } from './daily-session';
import { useDailySessionStore } from './state/use-daily-session-store';

export default function App() {
  const [instance, setInstance] = useState<PixiWordSearchInstance | null>(null);
  const [statusText, setStatusText] = useState('Select a puzzle and interact with the board.');

  const {
    state: shellState,
    activePuzzleProgress,
    setActivePuzzleId,
    syncPuzzleFromGameState,
    clearSessionProgress,
  } = useDailySessionStore({
    sessionId: dailySession.id,
    date: dailySession.date,
    topic: dailySession.topic,
    puzzles: dailySession.puzzles,
  });

  const activePuzzleIndex = dailySession.puzzles.findIndex(
    (puzzle) => String(puzzle.id) === shellState.activePuzzleId,
  );

  const activePuzzle =
    dailySession.puzzles[activePuzzleIndex >= 0 ? activePuzzleIndex : 0]!;

  const activePuzzleId = String(activePuzzle.id);

  const responsive = useMemo<ResponsiveOptions>(
    () => ({
      autoResize: true,
      mode: 'board-only',
      minCellSize: 32,
      maxCellSize: 72,
      allowZoom: true,
      allowPan: true,
    }),
    [],
  );

  const callbacks = useMemo(
    () => ({
      onWordFound(event: WordFoundEvent) {
        setStatusText(`Found word: ${event.wordId}`);
      },
      onWordDuplicate(event: WordDuplicateEvent) {
        setStatusText(`Already found: ${event.wordId}`);
      },
      onComplete() {
        setStatusText('Puzzle completed.');
      },
      onWordsRevealed() {
        setStatusText('Words revealed.');
      },
      onMissSelection() {
        setStatusText('No match.');
      },
    }),
    [],
  );

  useEffect(() => {
    setStatusText(`Opened example puzzle ${activePuzzleIndex + 1}.`);
    setInstance(null);
  }, [activePuzzleIndex]);

  const handleInstanceReady = useCallback(
    (nextInstance: PixiWordSearchInstance) => {
      const game = nextInstance.getGame();
      const snapshot = activePuzzleProgress.snapshot;

      if (snapshot && snapshot.puzzleId === activePuzzle.id) {
        game.hydrate(snapshot);
      }

      nextInstance.resetView();
      nextInstance.resize();

      syncPuzzleFromGameState(activePuzzleId, game.getState(), game.getSnapshot());
      setInstance(nextInstance);
    },
    [activePuzzle.id, activePuzzleId, activePuzzleProgress.snapshot, syncPuzzleFromGameState],
  );

  useEffect(() => {
    if (!instance) {
      return;
    }

    if (String(instance.getPuzzle().id) !== activePuzzleId) {
      return;
    }

    const game = instance.getGame();

    const unsubscribe = game.subscribe(() => {
      syncPuzzleFromGameState(activePuzzleId, game.getState(), game.getSnapshot());
    });

    return unsubscribe;
  }, [activePuzzleId, instance, syncPuzzleFromGameState]);

  return (
    <main className="shell-page">
      <header className="shell-header">
        <div>
          <p className="eyebrow">Integration example</p>
          <h1>daily-wordsearch-shell</h1>
          <p className="subtext">
            External consumer app for validating multi-puzzle usage of the package.
          </p>
        </div>

        <div className="status-card">
          <div className="status-title">Example session</div>
          <div className="status-value">
            {dailySession.topic} · {dailySession.date}
          </div>
          <div className="status-meta">{statusText}</div>
        </div>
      </header>

      <section className="shell-layout">
        <aside className="sidebar-card">
          <div className="sidebar-section">
            <div className="sidebar-title">Example puzzles</div>

            <div className="puzzle-list">
              {dailySession.puzzles.map((puzzle, index) => {
                const puzzleId = String(puzzle.id);
                const isActive = puzzleId === shellState.activePuzzleId;
                const progress = shellState.puzzles[puzzleId];
                const isCompleted = progress?.completed ?? false;
                const foundCount = progress?.foundCount ?? 0;

                return (
                  <button
                    key={puzzleId}
                    type="button"
                    className={`puzzle-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => {
                      setActivePuzzleId(puzzleId);
                    }}
                  >
                    <span className="puzzle-item-number">
                      Puzzle {index + 1}
                      {isCompleted ? ' · done' : ''}
                    </span>

                    <span className="puzzle-item-meta">
                      {foundCount}/{puzzle.words.length} found · {puzzle.size}×{puzzle.size}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Snapshot-backed state</div>

            <div className="info-grid">
              <div className="info-pill">
                <span>Words</span>
                <strong>{activePuzzle.words.length}</strong>
              </div>

              <div className="info-pill">
                <span>Found</span>
                <strong>{activePuzzleProgress.foundCount}</strong>
              </div>

              <div className="info-pill">
                <span>Status</span>
                <strong>{activePuzzleProgress.completed ? 'completed' : 'playing'}</strong>
              </div>

              <div className="info-pill">
                <span>Revealed</span>
                <strong>{activePuzzleProgress.revealedWords ? 'yes' : 'no'}</strong>
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Example controls</div>

            <div className="session-actions">
              <button
                type="button"
                className="action-button secondary full-width"
                onClick={() => {
                  clearSessionProgress();
                  instance?.getGame().restart();
                  instance?.getGame().start();
                  instance?.resetView();
                  setStatusText('Example session progress cleared.');
                }}
              >
                Clear example session
              </button>
            </div>
          </div>
        </aside>

        <section className="board-panel">
          <div className="board-panel-header">
            <div>
              <div className="board-title">Puzzle {activePuzzleIndex + 1}</div>
              <div className="board-subtitle">
                Minimal host app consuming the reusable package
              </div>
            </div>

            <div className="board-actions">
              <button
                type="button"
                className="action-button"
                onClick={() => {
                  instance?.getGame().restart();
                  instance?.getGame().start();
                  instance?.resetView();
                  setStatusText('Puzzle restarted.');
                }}
              >
                Restart
              </button>

              <button
                type="button"
                className="action-button secondary"
                onClick={() => {
                  instance?.getGame().revealWords();
                }}
              >
                Reveal
              </button>

              <button
                type="button"
                className="action-button secondary"
                onClick={() => {
                  instance?.resetView();
                  setStatusText('View reset.');
                }}
              >
                Reset view
              </button>
            </div>
          </div>

          <div className="board-card">
            <WordSearchBoard
              key={activePuzzleId}
              puzzle={activePuzzle}
              className="board-host"
              responsive={responsive}
              callbacks={callbacks}
              onInstanceReady={handleInstanceReady}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
