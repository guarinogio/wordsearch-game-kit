import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { createPixiWordSearch } from '@gioguarino/wordsearch-pixi';

import type {
  PixiWordSearchCallbacks,
  PixiWordSearchInstance,
  PixiWordSearchOptions,
} from '@gioguarino/wordsearch-pixi';
import type { WordSearchBoardHandle, WordSearchBoardProps } from './types';

import { useLatestRef } from './hooks/use-latest-ref';
import { usePersistentWordSearch } from './hooks/use-persistent-word-search';

export const WordSearchBoard = forwardRef<WordSearchBoardHandle, WordSearchBoardProps>(
  function WordSearchBoard(
    {
      puzzle,
      theme,
      responsive,
      callbacks,
      persistence,
      autoStart,
      className,
      style,
      onInstanceReady,
    },
    ref,
  ) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const instanceRef = useRef<PixiWordSearchInstance | null>(null);
    const [instanceState, setInstanceState] = useState<PixiWordSearchInstance | null>(null);

    const callbacksRef = useLatestRef<PixiWordSearchCallbacks | undefined>(callbacks);
    const onInstanceReadyRef = useLatestRef(onInstanceReady);

    const persistenceArgs = {
      instance: instanceState,
      puzzle,
      enabled: persistence?.enabled ?? false,
      ...(persistence?.namespace ? { namespace: persistence.namespace } : {}),
      ...(persistence?.storageKey ? { storageKey: persistence.storageKey } : {}),
    } as const;

    usePersistentWordSearch(persistenceArgs);

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
        resetView: () => {
          instanceRef.current?.resetView();
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

      const wrappedCallbacks: PixiWordSearchCallbacks = {
        onReady(instance) {
          callbacksRef.current?.onReady?.(instance);
        },
        onEvent(event) {
          callbacksRef.current?.onEvent?.(event);
        },
        onSelectionStart(event) {
          callbacksRef.current?.onSelectionStart?.(event);
        },
        onSelectionChange(event) {
          callbacksRef.current?.onSelectionChange?.(event);
        },
        onSelectionCommit(event) {
          callbacksRef.current?.onSelectionCommit?.(event);
        },
        onWordFound(event) {
          callbacksRef.current?.onWordFound?.(event);
        },
        onWordDuplicate(event) {
          callbacksRef.current?.onWordDuplicate?.(event);
        },
        onWordsRevealed(event) {
          callbacksRef.current?.onWordsRevealed?.(event);
        },
        onComplete(event) {
          callbacksRef.current?.onComplete?.(event);
        },
        onMissSelection(path) {
          callbacksRef.current?.onMissSelection?.(path);
        },
      };

      const options: PixiWordSearchOptions = {
        container: host,
        puzzle,
        callbacks: wrappedCallbacks,
        ...(theme ? { theme } : {}),
        ...(responsive ? { responsive } : {}),
        ...(autoStart !== undefined ? { autoStart } : {}),
      };

      void createPixiWordSearch(options).then((instance) => {
        if (disposed) {
          instance.destroy();
          return;
        }

        instanceRef.current = instance;
        setInstanceState(instance);
        onInstanceReadyRef.current?.(instance);
      });

      return () => {
        disposed = true;
        instanceRef.current?.destroy();
        instanceRef.current = null;
        setInstanceState(null);
      };
    }, [autoStart, callbacksRef, onInstanceReadyRef, puzzle, responsive, theme]);

    useEffect(() => {
      const instance = instanceRef.current;

      if (!instance) {
        return;
      }

      if (instance.getPuzzle().id !== puzzle.id) {
        instance.setPuzzle(puzzle);
      }
    }, [puzzle]);

    return <div ref={hostRef} className={className} style={style} />;
  },
);
