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

  const handlePointerDown = (event: PointerEvent): void => {
    const cell = options.getCellFromClientPoint(event.clientX, event.clientY);

    if (!cell) {
      return;
    }

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

  const endSelection = (pointerId: number | null): void => {
    if (!isPointerDown) {
      return;
    }

    if (pointerId !== null && activePointerId !== pointerId) {
      return;
    }

    isPointerDown = false;
    activePointerId = null;
    lastCellKey = null;
    options.onSelectionEnd();
  };

  const handlePointerUp = (event: PointerEvent): void => {
    endSelection(event.pointerId);
  };

  const handlePointerCancel = (event: PointerEvent): void => {
    if (activePointerId !== event.pointerId) {
      return;
    }

    isPointerDown = false;
    activePointerId = null;
    lastCellKey = null;
    options.onSelectionCancel?.();
  };

  options.element.addEventListener('pointerdown', handlePointerDown);
  options.element.addEventListener('pointermove', handlePointerMove);
  options.element.addEventListener('pointerup', handlePointerUp);
  options.element.addEventListener('pointercancel', handlePointerCancel);
  options.element.addEventListener('pointerleave', handlePointerCancel);

  return {
    destroy() {
      options.element.removeEventListener('pointerdown', handlePointerDown);
      options.element.removeEventListener('pointermove', handlePointerMove);
      options.element.removeEventListener('pointerup', handlePointerUp);
      options.element.removeEventListener('pointercancel', handlePointerCancel);
      options.element.removeEventListener('pointerleave', handlePointerCancel);
    },
  };
}
