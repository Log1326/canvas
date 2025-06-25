import { useEffect, useRef, useCallback, useMemo } from "react";
import { TObstacles, ObstacleType } from "@/types/types";
import { drawSingleObstacle } from "@/lib/drewObstacles";
import { generateObstacle } from "@/lib/calculate";
import {
  IMAGES_BACKGROUND,
  IMAGES_MODEL,
  IMAGES_OBSTACLE_SETS,
} from "@/lib/images";
import {
  drawModel,
  updateBackground,
  updateModelAngle,
  updateModelPosition,
} from "@/lib/drewMain";
import { createImage } from "@/lib/utils";

type UseCanvasGameProps = {
  activeBgIndex: number;
  activeModelIndex: number;
  activeObsIndex: number;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onGameOver: () => void;
  setGameStatus: (status: "idle" | "playing" | "paused" | "lost") => void;
};

export const useCanvasGame = ({
  activeBgIndex,
  activeObsIndex,
  activeModelIndex,
  isPlaying,
  setIsPlaying,
  onGameOver,
  setGameStatus,
}: UseCanvasGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const positionModelY = useRef(0);
  const speedY = useRef(0);
  const gravity = 0.8;
  const modelSize = Math.min(window.innerHeight, window.innerWidth) * 0.05;
  const modelSpeed = 1;
  const backgroundX = useRef(0);
  const angleRef = useRef(0);
  const targetAngleRef = useRef(0);
  const rotationSpeed = 0.05;
  const obstacleInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const obstacles = useRef<TObstacles>([]);
  const imgBackground = useRef(new Image());
  const imgModel = useRef(new Image());
  const imgStatic = useRef(new Image());
  const imgFlying = useRef(new Image());
  const imgFlyingAdditional = useRef(new Image());
  const hasLost = useRef(false);

  const resetGame = useCallback(() => {
    obstacles.current = [];
    const canvas = canvasRef.current;
    if (canvas) positionModelY.current = canvas.height / 2;
    else positionModelY.current = 0;
    speedY.current = 0;
    backgroundX.current = 0;
    angleRef.current = 0;
    targetAngleRef.current = 0;
    if (obstacleInterval.current) {
      clearInterval(obstacleInterval.current);
      obstacleInterval.current = null;
    }
  }, []);

  useEffect(() => {
    imgBackground.current.src = IMAGES_BACKGROUND[activeBgIndex];
    imgModel.current.src = IMAGES_MODEL[activeModelIndex];
    const selectedSet = IMAGES_OBSTACLE_SETS[activeObsIndex];
    imgStatic.current.src = selectedSet[0];
    imgFlying.current.src = selectedSet[1];
    imgFlyingAdditional.current.src = selectedSet[2];
  }, [activeBgIndex, activeModelIndex, activeObsIndex]);

  const obstacleImages = useMemo(() => {
    const set = IMAGES_OBSTACLE_SETS[activeObsIndex];
    return {
      [ObstacleType.Static]: createImage(set[0]),
      [ObstacleType.Flying]: createImage(set[1]),
      [ObstacleType.FlyingAdditional]: createImage(set[2]),
    };
  }, [activeObsIndex]);

  const handleGameOver = useCallback(() => {
    hasLost.current = true;
    setIsPlaying(false);
    setGameStatus("lost");
    onGameOver?.();
    resetGame();
  }, [setIsPlaying, onGameOver, resetGame, setGameStatus]);

  const drawObstacles = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      obstacles.current.forEach((obstacle) => {
        drawSingleObstacle({
          ctx,
          obstacle,
          images: obstacleImages,
          modelSpeed,
          canvasRef,
          modelSize,
          positionModelY,
          handleGameOver,
        });
      });

      obstacles.current = obstacles.current.filter((o) => o.x + o.width > 0);
    },
    [handleGameOver, modelSize, obstacleImages],
  );

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      updateBackground(ctx, imgBackground.current, backgroundX, modelSpeed);
      drawObstacles(ctx);
      if (Math.random() < 0.03)
        generateObstacle(isPlaying, canvasRef, obstacles);
      updateModelPosition(
        positionModelY,
        speedY,
        gravity,
        modelSize,
        ctx.canvas.height,
        handleGameOver,
      );
      updateModelAngle(speedY, angleRef, targetAngleRef, rotationSpeed);
      drawModel(
        ctx,
        imgModel.current,
        ctx.canvas.width,
        positionModelY,
        modelSize,
        angleRef,
      );
    },
    [drawObstacles, handleGameOver, isPlaying, modelSize],
  );

  const animate = useCallback(() => {
    if (!isPlaying) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) draw(ctx);
    requestRef.current = requestAnimationFrame(animate);
  }, [draw, isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    positionModelY.current = canvas.height / 2;
  }, []);

  useEffect(() => {
    if (isPlaying) {
      hasLost.current = false;
      requestRef.current = requestAnimationFrame(animate);
      obstacleInterval.current = setInterval(() => {
        generateObstacle(isPlaying, canvasRef, obstacles);
      }, 10000);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (obstacleInterval.current) clearInterval(obstacleInterval.current);
      obstacleInterval.current = null;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (obstacleInterval.current) clearInterval(obstacleInterval.current);
      obstacleInterval.current = null;
    };
  }, [animate, isPlaying, resetGame, setGameStatus]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        speedY.current = -10;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClick = useCallback(() => {
    speedY.current = -10;
  }, []);

  return {
    canvasRef,
    handleClick,
  };
};
