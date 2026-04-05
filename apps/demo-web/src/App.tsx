import { useCallback, useMemo, useState } from 'react';

import type {
  GameCompletedEvent,
  ResponsiveOptions,
  WordDuplicateEvent,
  WordFoundEvent,
} from '@gioguarino/wordsearch-types';
import type { PixiWordSearchInstance } from '@gioguarino/wordsearch-pixi';

import { WordSearchBoard } from '@gioguarino/wordsearch-react';

import { demoPuzzle } from './demo-puzzle';

export default function App() {
  const [instance, setInstance] = useState<PixiWordSearchInstance | null>(null);
  const [ready, setReady] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [score, setScore] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [statusText, setStatusText] = useState('Drag across a word with mouse or touch.');

  const responsive = useMemo<ResponsiveOptions>(
    () => ({
      autoResize: true,
      mode: 'board-only',
      minCellSize: 32,
      maxCellSize: 72,
    }),
    [],
  );

  const callbacks = useMemo(
    () => ({
      onWordFound(event: WordFoundEvent) {
        setFoundCount((count) => count + 1);
        setScore(event.score);
        setStatusText(`Found: ${event.wordId}`);
      },
      onWordDuplicate(event: WordDuplicateEvent) {
        setStatusText(`Already found: ${event.wordId}`);
      },
      onComplete(event: GameCompletedEvent) {
        setScore(event.score);
        setStatusText('Puzzle completed.');
      },
      onWordsRevealed() {
        setRevealed(true);
        setStatusText('Words revealed.');
      },
      onMissSelection() {
        setStatusText('No match. Try another line.');
      },
    }),
    [],
  );

  const handleInstanceReady = useCallback((nextInstance: PixiWordSearchInstance) => {
    setInstance(nextInstance);
    setReady(true);
  }, []);

  const gameState = instance?.getGame().getState() ?? null;

  const handleRestart = (): void => {
    instance?.getGame().restart();
    instance?.getGame().start();
    setFoundCount(0);
    setScore(0);
    setRevealed(false);
    setStatusText('Puzzle restarted.');
  };

  const handleReveal = (): void => {
    instance?.getGame().revealWords();
  };

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">React wrapper + controls</p>
          <h1>wordsearch-game-kit</h1>
          <p className="subtitle">{statusText}</p>
        </div>

        <div className="hud-stack">
          <div className="status-pill">{ready ? 'Renderer ready' : 'Booting Pixi...'}</div>
          <div className="status-pill subtle">
            Found {foundCount}/{demoPuzzle.words.length} · Score {score}
          </div>
        </div>
      </section>

      <section className="controls-card">
        <div className="controls-row">
          <button className="game-button" onClick={handleRestart} type="button">
            Restart
          </button>

          <button
            className="game-button secondary"
            onClick={handleReveal}
            type="button"
            disabled={revealed}
          >
            {revealed ? 'Words revealed' : 'Reveal words'}
          </button>
        </div>

        <div className="words-panel">
          {demoPuzzle.words.map((word) => {
            const found = gameState?.foundWordIds.includes(word.id) ?? false;

            return (
              <div
                key={word.id}
                className={`word-chip ${found ? 'is-found' : ''} ${revealed ? 'is-revealed' : ''}`}
              >
                {word.label}
              </div>
            );
          })}
        </div>
      </section>

      <section className="board-card">
        <WordSearchBoard
          puzzle={demoPuzzle}
          className="board-host"
          responsive={responsive}
          callbacks={callbacks}
          onInstanceReady={handleInstanceReady}
        />
      </section>
    </main>
  );
}
