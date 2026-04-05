import { Container, Graphics, Text, TextStyle } from 'pixi.js';

import type {
  LayoutMetrics,
  WordSearchPuzzle,
  WordSearchTheme,
} from '@gioguarino/wordsearch-types';

export class BoardRenderer {
  public readonly root: Container;

  private readonly backgroundLayer: Graphics;
  private readonly gridLayer: Graphics;
  private readonly lettersLayer: Container;

  constructor() {
    this.root = new Container();
    this.backgroundLayer = new Graphics();
    this.gridLayer = new Graphics();
    this.lettersLayer = new Container();

    this.root.addChild(this.backgroundLayer);
    this.root.addChild(this.gridLayer);
    this.root.addChild(this.lettersLayer);
  }

  render(puzzle: WordSearchPuzzle, theme: WordSearchTheme, metrics: LayoutMetrics): void {
    this.backgroundLayer.clear();
    this.gridLayer.clear();
    this.lettersLayer.removeChildren();

    const { boardX, boardY, boardSizePx, cellSizePx } = metrics;
    const gap = theme.cell.gap;
    const cellFill = theme.colors.boardBackground;
    const gridLine = theme.colors.gridLine;
    const letterColor = theme.colors.letter;
    const radius = theme.cell.cornerRadius;

    this.backgroundLayer.roundRect(boardX, boardY, boardSizePx, boardSizePx, radius);
    this.backgroundLayer.fill(cellFill);

    for (let row = 0; row < puzzle.size; row += 1) {
      for (let col = 0; col < puzzle.size; col += 1) {
        const x = boardX + col * cellSizePx;
        const y = boardY + row * cellSizePx;

        this.gridLayer.roundRect(
          x + gap * 0.5,
          y + gap * 0.5,
          cellSizePx - gap,
          cellSizePx - gap,
          Math.max(6, radius * 0.45),
        );
        this.gridLayer.stroke({
          color: gridLine,
          width: theme.cell.lineWidth,
          alpha: 1,
        });

        const letter = puzzle.grid[row]?.[col] ?? '';

        const text = new Text({
          text: letter,
          style: new TextStyle({
            fill: letterColor,
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: Math.floor(cellSizePx * theme.cell.fontSizeRatio),
            fontWeight: '700',
            align: 'center',
          }),
        });

        text.anchor.set(0.5);
        text.x = x + cellSizePx / 2;
        text.y = y + cellSizePx / 2;

        this.lettersLayer.addChild(text);
      }
    }
  }

  destroy(): void {
    this.root.destroy({
      children: true,
    });
  }
}
