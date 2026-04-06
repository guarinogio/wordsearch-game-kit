type Point = {
  x: number;
  y: number;
};

type ViewportControllerOptions = {
  element: HTMLCanvasElement;
  enabled: boolean;
  minScale?: number;
  maxScale?: number;
  getTransform: () => { x: number; y: number; scale: number };
  setTransform: (next: { x: number; y: number; scale: number }) => void;
  onGestureStateChange?: (isGesturing: boolean) => void;
};

export type ViewportController = {
  destroy: () => void;
  reset: () => void;
};

function distance(a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.hypot(dx, dy);
}

function midpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

export function createViewportController(
  options: ViewportControllerOptions,
): ViewportController {
  const minScale = options.minScale ?? 1;
  const maxScale = options.maxScale ?? 2.5;

  let isPanning = false;
  let lastPanPoint: Point | null = null;

  const pointers = new Map<number, Point>();
  let pinchStartDistance = 0;
  let pinchStartScale = 1;
  let pinchStartMidpoint: Point | null = null;

  const setGesturing = (): void => {
    options.onGestureStateChange?.(pointers.size >= 2 || isPanning);
  };

  const handleWheel = (event: WheelEvent): void => {
    if (!options.enabled) {
      return;
    }

    event.preventDefault();

    const rect = options.element.getBoundingClientRect();
    const cx = event.clientX - rect.left;
    const cy = event.clientY - rect.top;

    const current = options.getTransform();
    const zoomFactor = event.deltaY < 0 ? 1.08 : 0.92;
    const nextScale = Math.min(maxScale, Math.max(minScale, current.scale * zoomFactor));

    if (nextScale === current.scale) {
      return;
    }

    const worldX = (cx - current.x) / current.scale;
    const worldY = (cy - current.y) / current.scale;

    const nextX = cx - worldX * nextScale;
    const nextY = cy - worldY * nextScale;

    options.setTransform({
      x: nextX,
      y: nextY,
      scale: nextScale,
    });
  };

  const handlePointerDown = (event: PointerEvent): void => {
    if (!options.enabled) {
      return;
    }

    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size === 1) {
      const current = options.getTransform();

      if (current.scale > 1.02) {
        isPanning = true;
        lastPanPoint = { x: event.clientX, y: event.clientY };
      }
    }

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchStartDistance = distance(a, b);
      pinchStartScale = options.getTransform().scale;
      pinchStartMidpoint = midpoint(a, b);
      isPanning = false;
      lastPanPoint = null;
    }

    setGesturing();
  };

  const handlePointerMove = (event: PointerEvent): void => {
    if (!options.enabled) {
      return;
    }

    if (!pointers.has(event.pointerId)) {
      return;
    }

    pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const currentDistance = distance(a, b);
      const currentMidpoint = midpoint(a, b);

      if (pinchStartDistance > 0 && pinchStartMidpoint) {
        const current = options.getTransform();
        const nextScale = Math.min(
          maxScale,
          Math.max(minScale, pinchStartScale * (currentDistance / pinchStartDistance)),
        );

        const worldX = (pinchStartMidpoint.x - current.x) / current.scale;
        const worldY = (pinchStartMidpoint.y - current.y) / current.scale;

        const nextX = currentMidpoint.x - worldX * nextScale;
        const nextY = currentMidpoint.y - worldY * nextScale;

        options.setTransform({
          x: nextX,
          y: nextY,
          scale: nextScale,
        });
      }

      setGesturing();
      return;
    }

    if (isPanning && lastPanPoint) {
      const current = options.getTransform();
      const dx = event.clientX - lastPanPoint.x;
      const dy = event.clientY - lastPanPoint.y;

      lastPanPoint = { x: event.clientX, y: event.clientY };

      options.setTransform({
        x: current.x + dx,
        y: current.y + dy,
        scale: current.scale,
      });

      setGesturing();
    }
  };

  const endPointer = (pointerId: number): void => {
    pointers.delete(pointerId);

    if (pointers.size < 2) {
      pinchStartDistance = 0;
      pinchStartMidpoint = null;
    }

    if (pointers.size === 0) {
      isPanning = false;
      lastPanPoint = null;
    }

    setGesturing();
  };

  const handlePointerUp = (event: PointerEvent): void => {
    endPointer(event.pointerId);
  };

  const handlePointerCancel = (event: PointerEvent): void => {
    endPointer(event.pointerId);
  };

  options.element.addEventListener('wheel', handleWheel, { passive: false });
  options.element.addEventListener('pointerdown', handlePointerDown);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);
  window.addEventListener('pointercancel', handlePointerCancel);

  return {
    destroy() {
      options.element.removeEventListener('wheel', handleWheel);
      options.element.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    },

    reset() {
      pointers.clear();
      pinchStartDistance = 0;
      pinchStartMidpoint = null;
      isPanning = false;
      lastPanPoint = null;
      options.setTransform({
        x: 0,
        y: 0,
        scale: 1,
      });
      setGesturing();
    },
  };
}
