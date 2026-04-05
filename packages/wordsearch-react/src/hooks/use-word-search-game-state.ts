import { useEffect, useState } from 'react';

import type { GameState } from '@gioguarino/wordsearch-types';
import type { PixiWordSearchInstance } from '@gioguarino/wordsearch-pixi';

export function useWordSearchGameState(
  instance: PixiWordSearchInstance | null,
): GameState | null {
  const [state, setState] = useState<GameState | null>(
    instance ? instance.getGame().getState() : null,
  );

  useEffect(() => {
    if (!instance) {
      setState(null);
      return;
    }

    const game = instance.getGame();

    setState(game.getState());

    const unsubscribe = game.subscribe(() => {
      setState(game.getState());
    });

    return unsubscribe;
  }, [instance]);

  return state;
}
