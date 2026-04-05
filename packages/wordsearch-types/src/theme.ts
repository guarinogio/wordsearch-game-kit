export type WordSearchColorTheme = {
  background: number;
  boardBackground: number;
  gridLine: number;
  letter: number;
  selection: number;
  found: number;
  duplicate: number;
  accent: number;
};

export type WordSearchCellTheme = {
  cornerRadius: number;
  gap: number;
  fontSizeRatio: number;
  lineWidth: number;
};

export type WordSearchAnimationTheme = {
  selectionPulseMs: number;
  foundPulseMs: number;
  completionMs: number;
};

export type WordSearchTheme = {
  colors: WordSearchColorTheme;
  cell: WordSearchCellTheme;
  animation: WordSearchAnimationTheme;
  highContrast: boolean;
  reducedMotion: boolean;
};
