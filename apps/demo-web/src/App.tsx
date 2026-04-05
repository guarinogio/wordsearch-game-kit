import { useEffect, useRef, useState } from 'react';

import type { PixiWordSearchInstance } from '@gioguarino/wordsearch-pixi';

import { createPixiWordSearch } from '@gioguarino/wordsearch-pixi';

import { demoPuzzle } from './demo-puzzle';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<PixiWordSearchInstance | null>(null);
  const [ready, setReady] = useState(false);

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
          <p className="eyebrow">Pixi renderer base</p>
          <h1>wordsearch-game-kit</h1>
          <p className="subtitle">
            Responsive board renderer ready for desktop, Android and iOS.
          </p>
        </div>

        <div className="status-pill">{ready ? 'Renderer ready' : 'Booting Pixi...'}</div>
      </section>

      <section className="board-card">
        <div ref={containerRef} className="board-host" />
      </section>
    </main>
  );
}
