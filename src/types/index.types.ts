export enum ObstacleType {
  Mountain = 'mountain',
  Building = 'building',
  Lazer = 'lazer',
  Comet = 'comet',
  Rooster = 'rooster',
}
export type TObstacle = Array<{
  x: number
  y: number
  width: number
  height: number
  type: ObstacleType
  fromTop: boolean
}>
