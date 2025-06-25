export const updateBackground = (
  ctx: CanvasRenderingContext2D,
  imgBackground: HTMLImageElement,
  backgroundX: { current: number },
  modelSpeed: number,
) => {
  ctx.drawImage(
    imgBackground,
    backgroundX.current,
    0,
    ctx.canvas.width,
    ctx.canvas.height,
  );
  ctx.drawImage(
    imgBackground,
    backgroundX.current + ctx.canvas.width,
    0,
    ctx.canvas.width,
    ctx.canvas.height,
  );

  backgroundX.current -= modelSpeed;
  if (backgroundX.current <= -ctx.canvas.width) backgroundX.current = 0;
};

export const updateModelPosition = (
  positionModelY: { current: number },
  speedY: { current: number },
  gravity: number,
  modelSize: number,
  canvasHeight: number,
  handleGameOver: () => void,
) => {
  positionModelY.current += speedY.current;
  speedY.current += gravity;

  if (positionModelY.current > canvasHeight - modelSize) {
    positionModelY.current = canvasHeight - modelSize;
    speedY.current = 0;
    handleGameOver();
  } else if (positionModelY.current < 0) {
    positionModelY.current = 30;
    speedY.current = 0;
    handleGameOver();
  }
};

export const updateModelAngle = (
  speedY: { current: number },
  angleRef: { current: number },
  targetAngleRef: { current: number },
  rotationSpeed: number,
) => {
  const targetAngle =
    speedY.current > 0 ? (200 * Math.PI) / 200 : (10 * Math.PI) / 200;
  targetAngleRef.current = targetAngle;

  const angleDiff = targetAngleRef.current - angleRef.current;
  if (Math.abs(angleDiff) > rotationSpeed) {
    angleRef.current += Math.sign(angleDiff) * rotationSpeed;
  } else {
    angleRef.current = targetAngleRef.current;
  }
};

export const drawModel = (
  ctx: CanvasRenderingContext2D,
  imgModel: HTMLImageElement,
  canvasWidth: number,
  positionModelY: { current: number },
  modelSize: number,
  angleRef: { current: number },
) => {
  ctx.save();
  ctx.translate(canvasWidth / 2, positionModelY.current + modelSize / 2);
  ctx.rotate(angleRef.current);
  ctx.drawImage(imgModel, -modelSize / 2, -modelSize / 2, modelSize, modelSize);
  ctx.restore();
};
