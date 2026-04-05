export type Insets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type LayoutMode = 'compact' | 'comfortable' | 'wide';

export type ResponsiveMode = 'board-only' | 'board-with-hud';

export type ResponsiveBreakpoints = {
  compact: number;
  comfortable: number;
  wide: number;
};

export type ResponsiveOptions = {
  mode?: ResponsiveMode;
  autoResize?: boolean;
  minCellSize?: number;
  maxCellSize?: number;
  allowZoom?: boolean;
  allowPan?: boolean;
  hitSlop?: number;
  safeAreaInsets?: Insets;
  responsiveBreakpoints?: ResponsiveBreakpoints;
};

export type LayoutMetrics = {
  viewportWidth: number;
  viewportHeight: number;
  boardSizePx: number;
  cellSizePx: number;
  boardX: number;
  boardY: number;
  mode: LayoutMode;
};
