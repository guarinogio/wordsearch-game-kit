import { useEffect, useRef } from 'react';

import { createPixiWordSearch } from '@gioguarino/wordsearch-pixi';

import type { PixiWordSearchInstance, PixiWordSearchOptions } from '@gioguarino/wordsearch-pixi';
import type { WordSearchBoardProps } from './types';

export function WordSearchBoard({
  puzzle,
  theme,
  responsive,
  callbacks,
  autoStart,
  className,
  style,
  onInstanceReady,
}: WordSearchBoardProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<PixiWordSearchInstance | null>(null);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return;
    }

    let disposed = false;

    const options: PixiWordSearchOptions = {
      container: host,
      puzzle,
      ...(theme ? { theme } : {}),
      ...(responsive ? { responsive } : {}),
      ...(callbacks ? { callbacks } : {}),
      ...(autoStart !== undefined ? { autoStart } : {}),
    };

    void createPixiWordSearch(options).then((instance) => {
      if (disposed) {
        instance.destroy();
        return;
      }

      instanceRef.current = instance;
      onInstanceReady?.(instance);
    });

    return () => {
      disposed = true;
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [autoStart, callbacks, onInstanceReady, puzzle, responsive, theme]);

  return <div ref={hostRef} className={className} style={style} />;
}
