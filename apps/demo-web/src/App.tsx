import { useEffect, useRef, useState } from 'react';

import type { PixiWordSearchInstance } from '@gioguarino/wordsearch-pixi';

import { createPixiWordSearch } from '@gioguarino/wordsearch-pixi';

import { demoPuzzle } from './demo-puzzle';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<PixiWordSearchInstance | null>(null);
  const [ready, setReady] = useState(false);
  const [foundCount, setFoundCount] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    let disposed = false;

    void createPixiWordSearch({
      container,
      puzzle: demoPuzzle,
      responsive: {
        autoResize: true,
        mode: 'board-only',
        minCellSize: 32,
        maxCellSize: 72,
      },
    }).then((instance) => {
      if (disposed) {
        instance.destroy();
        return;
      }

      instanceRef.current = instance;
      setReady(true);

      const updateState = (): void => {
        const gameState = instance.getGame().getState();
        setFoundCount(gameState.foundWordIds.length);
        setScore(gameState.score);
      };

      updateState();

      const unsubscribe = instance.getGame().subscribe(() => {
        updateState();
      });

      const originalDestroy = instance.destroy.bind(instance);

      instance.destroy = () => {
        unsubscribe();
        originalDestroy();
      };
    });

    return () => {
      disposed = true;
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Pixi renderer interactive</p>
          <h1>wordsearch-game-kit</h1>
          <p className="subtitle">
            Drag across a word with mouse or touch. Found words stay marked on the board.
          </p>
        </div>

        <div className="hud-stack">
          <div className="status-pill">{ready ? 'Renderer ready' : 'Booting Pixi...'}</div>
          <div className="status-pill subtle">
            Found {foundCount}/{demoPuzzle.words.length} · Score {score}
          </div>
        </div>
      </section>

      <section className="board-card">
        <div ref={containerRef} className="board-host" />
      </section>
    </main>
  );
}
