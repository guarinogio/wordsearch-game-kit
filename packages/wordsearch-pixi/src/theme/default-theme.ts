import type { WordSearchTheme } from '@gioguarino/wordsearch-types';

export const defaultWordSearchTheme: WordSearchTheme = {
  colors: {
    background: 0x0b1020,
    boardBackground: 0x121a31,
    gridLine: 0x25304d,
    letter: 0xf8fafc,
    selection: 0x60a5fa,
    found: 0x34d399,
    duplicate: 0xf59e0b,
    accent: 0x8b5cf6,
  },
  cell: {
    cornerRadius: 12,
    gap: 4,
    fontSizeRatio: 0.42,
    lineWidth: 1.5,
  },
  animation: {
    selectionPulseMs: 140,
    foundPulseMs: 220,
    completionMs: 650,
  },
  highContrast: false,
  reducedMotion: false,
};
