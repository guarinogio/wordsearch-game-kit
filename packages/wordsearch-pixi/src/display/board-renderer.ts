import { Container, Graphics, Text, TextStyle } from 'pixi.js';

import type {
  Cell,
  LayoutMetrics,
  WordSearchPuzzle,
  WordSearchTheme,
} from '@gioguarino/wordsearch-types';

import { FoundWordsRenderer } from './found-words-renderer';
import { PathOverlayRenderer } from './path-overlay-renderer';
import { SelectionRenderer } from './selection-renderer';

export class BoardRenderer {
  public readonly root: Container;

  private readonly backgroundLayer: Graphics;
  private readonly gridLayer: Graphics;
  private readonly revealLayer: PathOverlayRenderer;
  private readonly foundWordsLayer: FoundWordsRenderer;
  private readonly feedbackLayer: PathOverlayRenderer;
  private readonly selectionLayer: SelectionRenderer;
  private readonly lettersLayer: Container;

  constructor() {
    this.root = new Container();
    this.backgroundLayer = new Graphics();
    this.gridLayer = new Graphics();
    this.revealLayer = new PathOverlayRenderer();
    this.foundWordsLayer = new FoundWordsRenderer();
    this.feedbackLayer = new PathOverlayRenderer();
    this.selectionLayer = new SelectionRenderer();
    this.lettersLayer = new Container();

    this.root.addChild(this.backgroundLayer);
    this.root.addChild(this.gridLayer);
    this.root.addChild(this.revealLayer.root);
    this.root.addChild(this.foundWordsLayer.root);
    this.root.addChild(this.feedbackLayer.root);
    this.root.addChild(this.selectionLayer.root);
    this.root.addChild(this.lettersLayer);
  }

  renderBase(puzzle: WordSearchPuzzle, theme: WordSearchTheme, metrics: LayoutMetrics): void {
    this.backgroundLayer.clear();
    this.gridLayer.clear();
    this.lettersLayer.removeChildren();

    const { boardX, boardY, boardSizePx, cellSizePx } = metrics;
    const gap: number = theme.cell.gap;
    const cellFill: number = theme.colors.boardBackground;
    const gridLine: number = theme.colors.gridLine;
    const letterColor: number = theme.colors.letter;
    const radius: number = theme.cell.cornerRadius;

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

        const letter: string = puzzle.grid[row]?.[col] ?? '';

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

  renderReveal(paths: Cell[][], metrics: LayoutMetrics, theme: WordSearchTheme): void {
    this.revealLayer.render(paths, metrics, theme, {
      color: theme.colors.reveal,
      fillAlpha: 0.14,
      strokeAlpha: 0.75,
      lineWidth: Math.max(2, theme.cell.lineWidth + 0.5),
    });
  }

  clearReveal(): void {
    this.revealLayer.clear();
  }

  renderSelection(path: Cell[], metrics: LayoutMetrics, theme: WordSearchTheme): void {
    this.selectionLayer.render(path, metrics, theme);
  }

  clearSelection(): void {
    this.selectionLayer.clear();
  }

  renderFoundWords(paths: Cell[][], metrics: LayoutMetrics, theme: WordSearchTheme): void {
    this.foundWordsLayer.render(paths, metrics, theme);
  }

  clearFoundWords(): void {
    this.foundWordsLayer.clear();
  }

  renderFeedback(
    paths: Cell[][],
    metrics: LayoutMetrics,
    theme: WordSearchTheme,
    variant: 'miss' | 'duplicate',
  ): void {
    const color: number =
      variant === 'duplicate' ? theme.colors.duplicate : theme.colors.miss;

    this.feedbackLayer.render(paths, metrics, theme, {
      color,
      fillAlpha: 0.18,
      strokeAlpha: 0.95,
      lineWidth: Math.max(2.5, theme.cell.lineWidth + 1.5),
    });
  }

  clearFeedback(): void {
    this.feedbackLayer.clear();
  }

  destroy(): void {
    this.root.destroy({
      children: true,
    });
  }
}
