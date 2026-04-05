import { Container, Graphics } from 'pixi.js';

import type {
  Cell,
  LayoutMetrics,
  WordSearchTheme,
} from '@gioguarino/wordsearch-types';

type OverlayStyle = {
  color: number;
  fillAlpha: number;
  strokeAlpha: number;
  lineWidth: number;
};

export class PathOverlayRenderer {
  public readonly root: Container;

  private readonly graphics: Graphics;

  constructor() {
    this.root = new Container();
    this.graphics = new Graphics();
    this.root.addChild(this.graphics);
  }

  render(paths: Cell[][], metrics: LayoutMetrics, theme: WordSearchTheme, style: OverlayStyle): void {
    this.graphics.clear();

    if (paths.length === 0) {
      return;
    }

    const cellSize = metrics.cellSizePx;
    const radius = Math.max(8, theme.cell.cornerRadius * 0.65);

    for (const path of paths) {
      for (const cell of path) {
        const x = metrics.boardX + cell.col * cellSize;
        const y = metrics.boardY + cell.row * cellSize;

        this.graphics.roundRect(
          x + theme.cell.gap * 0.5,
          y + theme.cell.gap * 0.5,
          cellSize - theme.cell.gap,
          cellSize - theme.cell.gap,
          radius,
        );
        this.graphics.fill({
          color: style.color,
          alpha: style.fillAlpha,
        });
        this.graphics.stroke({
          color: style.color,
          width: style.lineWidth,
          alpha: style.strokeAlpha,
        });
      }
    }
  }

  clear(): void {
    this.graphics.clear();
  }

  destroy(): void {
    this.root.destroy({
      children: true,
    });
  }
}
