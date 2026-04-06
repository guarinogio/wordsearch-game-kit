import { useMemo, useState } from 'react';

import type {
  GameCompletedEvent,
  WordDuplicateEvent,
  WordFoundEvent,
} from '@gioguarino/wordsearch-types';
import type { PixiWordSearchInstance } from '@gioguarino/wordsearch-pixi';

import { WordSearchBoard } from '@gioguarino/wordsearch-react';

import { dailySession } from './daily-session';

export default function App() {
  const [activePuzzleIndex, setActivePuzzleIndex] = useState(0);
  const [instance, setInstance] = useState<PixiWordSearchInstance | null>(null);
  const [statusText, setStatusText] = useState('Choose a puzzle and start playing.');

  const activePuzzle = dailySession.puzzles[activePuzzleIndex]!;

  const callbacks = useMemo(
    () => ({
      onWordFound(event: WordFoundEvent) {
        setStatusText(`Found word: ${event.wordId}`);
      },
      onWordDuplicate(event: WordDuplicateEvent) {
        setStatusText(`Already found: ${event.wordId}`);
      },
      onComplete(_event: GameCompletedEvent) {
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

  const gameState = instance?.getGame().getState() ?? null;

  return (
    <main className="shell-page">
      <header className="shell-header">
        <div>
          <p className="eyebrow">Daily shell base</p>
          <h1>{dailySession.topic}</h1>
          <p className="subtext">
            Date {dailySession.date} · {dailySession.puzzles.length} puzzles
          </p>
        </div>

        <div className="status-card">
          <div className="status-title">Current puzzle</div>
          <div className="status-value">
            #{activePuzzleIndex + 1} · {activePuzzle.topic}
          </div>
          <div className="status-meta">{statusText}</div>
        </div>
      </header>

      <section className="shell-layout">
        <aside className="sidebar-card">
          <div className="sidebar-section">
            <div className="sidebar-title">Puzzles</div>

            <div className="puzzle-list">
              {dailySession.puzzles.map((puzzle, index) => {
                const isActive = index === activePuzzleIndex;

                return (
                  <button
                    key={String(puzzle.id)}
                    type="button"
                    className={`puzzle-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => {
                      setActivePuzzleIndex(index);
                      setStatusText(`Opened puzzle ${index + 1}.`);
                    }}
                  >
                    <span className="puzzle-item-number">Puzzle {index + 1}</span>
                    <span className="puzzle-item-meta">
                      {puzzle.words.length} words · {puzzle.size}×{puzzle.size}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-title">Puzzle info</div>

            <div className="info-grid">
              <div className="info-pill">
                <span>Words</span>
                <strong>{activePuzzle.words.length}</strong>
              </div>

              <div className="info-pill">
                <span>Found</span>
                <strong>{gameState?.foundWordIds.length ?? 0}</strong>
              </div>

              <div className="info-pill">
                <span>Status</span>
                <strong>{gameState?.status ?? 'idle'}</strong>
              </div>

              <div className="info-pill">
                <span>Revealed</span>
                <strong>{gameState?.revealedWords ? 'yes' : 'no'}</strong>
              </div>
            </div>
          </div>
        </aside>

        <section className="board-panel">
          <div className="board-panel-header">
            <div>
              <div className="board-title">Puzzle {activePuzzleIndex + 1}</div>
              <div className="board-subtitle">
                Multi-puzzle shell using the reusable package
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
            </div>
          </div>

          <div className="board-card">
            <WordSearchBoard
              puzzle={activePuzzle}
              className="board-host"
              responsive={{
                autoResize: true,
                mode: 'board-only',
                minCellSize: 32,
                maxCellSize: 72,
                allowZoom: true,
                allowPan: true,
              }}
              callbacks={callbacks}
              onInstanceReady={(nextInstance) => {
                setInstance(nextInstance);
              }}
            />
          </div>
        </section>
      </section>
    </main>
  );
}
