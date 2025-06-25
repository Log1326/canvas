export enum ObstacleType {
  Static = "static",
  Flying = "flying",
  FlyingAdditional = "flying-additoonal",
}
export type TObstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  fromTop: boolean;
};
export type TObstacles = TObstacle[];
