import { ObstacleType, TObstacles } from "@/types/types";

export const checkCollision = (
  obstacle: {
    x: number;
    y: number;
    width: number;
    height: number;
    type: ObstacleType;
    fromTop: boolean;
  },
  canvasRef: React.RefObject<HTMLCanvasElement>,
  modelSize: number,
  modelPositionY: React.MutableRefObject<number>,
) => {
  const { modelX, modelY } = getModelPosition(
    canvasRef,
    modelSize,
    modelPositionY,
  );

  if (
    obstacle.type === ObstacleType.Flying ||
    obstacle.type === ObstacleType.FlyingAdditional
  ) {
    const HITBOX_MARGIN = 30;

    const reducedX = obstacle.x + HITBOX_MARGIN;
    const reducedY = obstacle.y + HITBOX_MARGIN;
    const reducedWidth = obstacle.width - HITBOX_MARGIN * 2;
    const reducedHeight = obstacle.height - HITBOX_MARGIN * 2;

    const intersectsX =
      modelX < reducedX + reducedWidth && modelX + modelSize > reducedX;
    const intersectsY =
      modelY < reducedY + reducedHeight && modelY + modelSize > reducedY;

    const collided = intersectsX && intersectsY;

    return collided;
  }

  if (obstacle.type === ObstacleType.Static) {
    let corners: Point[];
    if (obstacle.fromTop) {
      corners = [
        [obstacle.x, obstacle.y],
        [obstacle.x + obstacle.width, obstacle.y],
        [obstacle.x + obstacle.width / 2, obstacle.y - obstacle.height],
      ];
    } else {
      corners = [
        [obstacle.x, obstacle.y + obstacle.height],
        [obstacle.x + obstacle.width, obstacle.y + obstacle.height],
        [obstacle.x + obstacle.width / 2, obstacle.y],
      ];
    }

    const modelCorners: Point[] = [
      [modelX, modelY],
      [modelX + modelSize, modelY],
      [modelX + modelSize, modelY + modelSize],
      [modelX, modelY + modelSize],
    ];

    const collided = isRectangleIntersectingTriangle(modelCorners, corners);

    return collided;
  }

  return false;
};
type Point = [number, number];
function doLineSegmentsIntersect(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point,
): boolean {
  function ccw(a: Point, b: Point, c: Point): boolean {
    return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0]);
  }
  return (
    ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4)
  );
}

function isPointInTriangle(
  px: number,
  py: number,
  tx1: number,
  ty1: number,
  tx2: number,
  ty2: number,
  tx3: number,
  ty3: number,
): boolean {
  const d1 = (px - tx2) * (ty1 - ty2) - (tx1 - tx2) * (py - ty2);
  const d2 = (px - tx3) * (ty2 - ty3) - (tx2 - tx3) * (py - ty3);
  const d3 = (px - tx1) * (ty3 - ty1) - (tx3 - tx1) * (py - ty1);

  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0;

  return !(hasNeg && hasPos);
}

function isRectangleIntersectingTriangle(
  rectCorners: Point[],
  triCorners: Point[],
): boolean {
  const rectEdges: [Point, Point][] = [
    [rectCorners[0], rectCorners[1]],
    [rectCorners[1], rectCorners[2]],
    [rectCorners[2], rectCorners[3]],
    [rectCorners[3], rectCorners[0]],
  ];

  const triEdges: [Point, Point][] = [
    [triCorners[0], triCorners[1]],
    [triCorners[1], triCorners[2]],
    [triCorners[2], triCorners[0]],
  ];

  for (const [p1, p2] of rectEdges) {
    for (const [p3, p4] of triEdges) {
      if (doLineSegmentsIntersect(p1, p2, p3, p4)) {
        return true;
      }
    }
  }

  for (const [px, py] of rectCorners) {
    if (
      isPointInTriangle(
        px,
        py,
        triCorners[0][0],
        triCorners[0][1],
        triCorners[1][0],
        triCorners[1][1],
        triCorners[2][0],
        triCorners[2][1],
      )
    ) {
      return true;
    }
  }

  for (const [tx, ty] of triCorners) {
    if (
      tx >= rectCorners[0][0] &&
      tx <= rectCorners[2][0] &&
      ty >= rectCorners[0][1] &&
      ty <= rectCorners[2][1]
    ) {
      return true;
    }
  }

  return false;
}

const getModelPosition = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  modelSize: number,
  posY: React.MutableRefObject<number>,
) => {
  const modelX = canvasRef.current!.width / 2 - modelSize / 2;
  const modelY = posY.current;

  return { modelX, modelY };
};

export const generateObstacle = (
  isPlaying: boolean,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  obstacles: React.MutableRefObject<TObstacles>,
) => {
  if (!isPlaying) return;
  const canvasWidth = canvasRef.current!.width;
  const canvasHeight = canvasRef.current!.height;
  const buildingCount = obstacles.current.filter(
    (o) => o.type === ObstacleType.Static,
  ).length;

  const staticSize =
    (buildingCount + 1) % 3 === 0 ? canvasHeight / 3 : 75 + Math.random() * 75;
  const fromTop = Math.random() > 0.5;
  const type = Object.values(ObstacleType)[
    Math.floor(Math.random() * Object.values(ObstacleType).length)
  ] as ObstacleType;
  let size = 0;
  switch (type) {
    case ObstacleType.Static:
      size = staticSize;
      break;
    case ObstacleType.Flying:
      size = 40 + Math.random() * 60;
      break;
    case ObstacleType.FlyingAdditional:
      size = 40 + Math.random() * 60;
      break;
  }

  let y = fromTop ? 0 : canvasHeight - size;
  if (type === ObstacleType.Flying || type === ObstacleType.FlyingAdditional) {
    const verticalSpread = (Math.random() - 0.5) * 400;
    y = (canvasHeight - size) / 2 + verticalSpread;
  }
  const newObstacle = {
    x: canvasWidth,
    y: Math.round(y),
    width: Math.round(size),
    height: Math.round(size),
    type,
    fromTop,
  };
  obstacles.current.push(newObstacle);
};
