import type { Cell } from '@gioguarino/wordsearch-types';

type PointerControllerOptions = {
  element: HTMLCanvasElement;
  getCellFromClientPoint: (clientX: number, clientY: number) => Cell | null;
  onSelectionStart: (cell: Cell) => void;
  onSelectionMove: (cell: Cell) => void;
  onSelectionEnd: () => void;
  onSelectionCancel?: () => void;
};

export type PointerController = {
  destroy: () => void;
};

export function createPointerController(
  options: PointerControllerOptions,
): PointerController {
  let isPointerDown = false;
  let activePointerId: number | null = null;
  let lastCellKey: string | null = null;

  const toCellKey = (cell: Cell): string => `${cell.row}:${cell.col}`;

  const reset = (): void => {
    isPointerDown = false;
    activePointerId = null;
    lastCellKey = null;
  };

  const handlePointerDown = (event: PointerEvent): void => {
    if (isPointerDown) {
      return;
    }

    const cell = options.getCellFromClientPoint(event.clientX, event.clientY);

    if (!cell) {
      return;
    }

    event.preventDefault();

    isPointerDown = true;
    activePointerId = event.pointerId;
    lastCellKey = toCellKey(cell);

    options.element.setPointerCapture(event.pointerId);
    options.onSelectionStart(cell);
  };

  const handlePointerMove = (event: PointerEvent): void => {
    if (!isPointerDown || activePointerId !== event.pointerId) {
      return;
    }

    const cell = options.getCellFromClientPoint(event.clientX, event.clientY);

    if (!cell) {
      return;
    }

    const key = toCellKey(cell);

    if (key === lastCellKey) {
      return;
    }

    lastCellKey = key;
    options.onSelectionMove(cell);
  };

  const handlePointerUp = (event: PointerEvent): void => {
    if (!isPointerDown || activePointerId !== event.pointerId) {
      return;
    }

    if (options.element.hasPointerCapture(event.pointerId)) {
      options.element.releasePointerCapture(event.pointerId);
    }

    reset();
    options.onSelectionEnd();
  };

  const handlePointerCancel = (event: PointerEvent): void => {
    if (!isPointerDown || activePointerId !== event.pointerId) {
      return;
    }

    if (options.element.hasPointerCapture(event.pointerId)) {
      options.element.releasePointerCapture(event.pointerId);
    }

    reset();
    options.onSelectionCancel?.();
  };

  options.element.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointercancel', handlePointerCancel);

  return {
    destroy() {
      options.element.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    },
  };
}
