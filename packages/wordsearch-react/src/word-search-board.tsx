import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';

import { createPixiWordSearch } from '@gioguarino/wordsearch-pixi';

import type { PixiWordSearchInstance, PixiWordSearchOptions } from '@gioguarino/wordsearch-pixi';
import type { WordSearchBoardHandle, WordSearchBoardProps } from './types';

export const WordSearchBoard = forwardRef<WordSearchBoardHandle, WordSearchBoardProps>(
  function WordSearchBoard(
    {
      puzzle,
      theme,
      responsive,
      callbacks,
      autoStart,
      className,
      style,
      onInstanceReady,
    },
    ref,
  ) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const instanceRef = useRef<PixiWordSearchInstance | null>(null);

    useImperativeHandle(
      ref,
      () => ({
        getInstance: () => instanceRef.current,
        getGameState: () => instanceRef.current?.getGame().getState() ?? null,
        restart: () => {
          instanceRef.current?.getGame().restart();
          if (autoStart ?? true) {
            instanceRef.current?.getGame().start();
          }
        },
        revealWords: () => {
          instanceRef.current?.getGame().revealWords();
        },
        resize: () => {
          instanceRef.current?.resize();
        },
      }),
      [autoStart],
    );

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
  },
);
