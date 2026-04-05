import { useRef } from 'react';

import type { PixiWordSearchInstance } from '@gioguarino/wordsearch-pixi';

export function useWordSearchInstance() {
  return useRef<PixiWordSearchInstance | null>(null);
}
