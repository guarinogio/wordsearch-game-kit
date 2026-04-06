type ClampTransformArgs = {
  containerWidth: number;
  containerHeight: number;
  contentX: number;
  contentY: number;
  contentWidth: number;
  contentHeight: number;
  x: number;
  y: number;
  scale: number;
};

export type ViewTransform = {
  x: number;
  y: number;
  scale: number;
};

export function clampTransform(args: ClampTransformArgs): ViewTransform {
  const {
    containerWidth,
    containerHeight,
    contentX,
    contentY,
    contentWidth,
    contentHeight,
    x,
    y,
    scale,
  } = args;

  if (scale <= 1.001) {
    return {
      x: 0,
      y: 0,
      scale: 1,
    };
  }

  const minX = containerWidth - (contentX + contentWidth) * scale;
  const maxX = -contentX * scale;

  const minY = containerHeight - (contentY + contentHeight) * scale;
  const maxY = -contentY * scale;

  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(maxY, Math.max(minY, y)),
    scale,
  };
}
