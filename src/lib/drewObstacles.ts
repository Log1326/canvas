import { ObstacleType, TObstacle } from "@/types/types";
import { checkCollision } from "./calculate";

export const getObstacleImage = (
  obstacle: TObstacle,
  images: Record<ObstacleType, HTMLImageElement>,
): HTMLImageElement | null => {
  return images[obstacle.type] || null;
};

export const applyClipping = (
  ctx: CanvasRenderingContext2D,
  obstacle: TObstacle,
): Path2D => {
  const path = new Path2D();

  if (obstacle.type === ObstacleType.Static) {
    if (obstacle.fromTop) {
      path.moveTo(obstacle.x, obstacle.y);
      path.lineTo(obstacle.x + obstacle.width, obstacle.y);
      path.lineTo(
        obstacle.x + obstacle.width / 2,
        obstacle.y - obstacle.height,
      );
    } else {
      path.moveTo(obstacle.x, obstacle.y + obstacle.height);
      path.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
      path.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
    }
  } else path.rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

  path.closePath();
  ctx.clip(path);

  return path;
};

type DrawSingleObstacleParams = {
  ctx: CanvasRenderingContext2D;
  obstacle: TObstacle;
  images: Record<ObstacleType, HTMLImageElement>;
  modelSpeed: number;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  modelSize: number;
  positionModelY: React.MutableRefObject<number>;
  handleGameOver: () => void;
};

export const drawSingleObstacle = ({
  ctx,
  obstacle,
  images,
  modelSpeed,
  canvasRef,
  modelSize,
  positionModelY,
  handleGameOver,
}: DrawSingleObstacleParams) => {
  const img = getObstacleImage(obstacle, images);
  if (!img) return;

  ctx.save();

  ctx.translate(
    obstacle.x + obstacle.width / 2,
    obstacle.y + obstacle.height / 2,
  );

  if (obstacle.type === ObstacleType.Static && obstacle.fromTop)
    ctx.rotate(Math.PI);

  ctx.translate(-obstacle.width / 2, -obstacle.height / 2);

  ctx.drawImage(img, 0, 0, obstacle.width, obstacle.height);

  ctx.restore();

  if (obstacle.type === ObstacleType.Static) {
    const path = new Path2D();

    if (obstacle.type === ObstacleType.Static) {
      if (obstacle.fromTop) {
        path.moveTo(obstacle.x, obstacle.y);
        path.lineTo(obstacle.x + obstacle.width, obstacle.y);
        path.lineTo(
          obstacle.x + obstacle.width / 2,
          obstacle.y - obstacle.height,
        );
      } else {
        path.moveTo(obstacle.x, obstacle.y + obstacle.height);
        path.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        path.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
      }
    } else path.rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

    path.closePath();

    ctx.save();
    ctx.restore();
  } else {
    ctx.save();
    ctx.restore();
  }

  if (
    obstacle.type === ObstacleType.Flying ||
    obstacle.type === ObstacleType.FlyingAdditional
  )
    obstacle.x -= modelSpeed + 2;
  else obstacle.x -= modelSpeed;

  if (
    canvasRef.current &&
    checkCollision(obstacle, canvasRef, modelSize, positionModelY)
  )
    handleGameOver();
};
