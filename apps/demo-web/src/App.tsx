import { useMemo, useState } from 'react';

import type {
  GameCompletedEvent,
  WordDuplicateEvent,
  WordFoundEvent,
} from '@gioguarino/wordsearch-types';

import { WordSearchBoard } from '@gioguarino/wordsearch-react';

import { demoPuzzle } from './demo-puzzle';

export default function App() {
  const [ready, setReady] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [score, setScore] = useState(0);
  const [statusText, setStatusText] = useState('Drag across a word with mouse or touch.');

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
      onMissSelection() {
        setStatusText('No match. Try another line.');
      },
    }),
    [],
  );

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">React wrapper + Pixi runtime</p>
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

      <section className="board-card">
        <WordSearchBoard
          puzzle={demoPuzzle}
          className="board-host"
          responsive={{
            autoResize: true,
            mode: 'board-only',
            minCellSize: 32,
            maxCellSize: 72,
          }}
          callbacks={callbacks}
          onInstanceReady={() => {
            setReady(true);
          }}
        />
      </section>
    </main>
  );
}
