import { TObstacle } from '@/App'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import IMG_BACKGROUND_2 from '@/assets/2207_w026_n002_2270b_p1_2270.jpg'
import IMG_BACKGROUND_3 from '@/assets/2306.w026.n002.3526B.p1.3526.jpg'
import IMG_BACKGROUND_1 from '@/assets/be454f2d-02f9-4e51-a1b7-942189723a7e.jpg'

import IMG_BUILDING_2 from '@/assets/building-svgrepo-com.svg'
import IMG_BUILDING_1 from '@/assets/building-town-svgrepo-com.svg'

import IMG_COMET from '@/assets/comet-svgrepo-com.svg'
import IMG_LINE from '@/assets/line-solid-svgrepo-com.svg'
import IMG_ROOSTER from '@/assets/rooster-svgrepo-com.svg'

import IMG_MOUNTAIN_1 from '@/assets/mountain-svgrepo-com.svg'

import IMG_MODEL_MAN from '@/assets/man-superhero-light-skin-tone-svgrepo-com.svg'
import IMG_MODEL_PENIS from '@/assets/penis-svgrepo-com.svg'
import IMG_MODEL_PLANE from '@/assets/plane-airplane-svgrepo-com.svg'
import IMG_MODEL_ROCKET from '@/assets/rocket-svgrepo-com.svg'
import IMG_MODEL_SUPER_HERO_DAR from '@/assets/superhero-dark-skin-tone-svgrepo-com.svg'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
export const checkCollision = (
  obstacle: {
    x: number
    y: number
    width: number
    height: number
    type: 'mountain' | 'building'
    fromTop: boolean
    triangleVertices?: [number, number, number, number, number, number]
  },
  canvasRef: React.RefObject<HTMLCanvasElement>,
  squareSize: number,
  posY: React.MutableRefObject<number>
) => {
  const obstacleX = canvasRef.current!.width / 2 - squareSize / 2
  const obstacleY = posY.current

  if (obstacle.type === 'building') {
    const intersectsX =
      obstacleX < obstacle.x + obstacle.width &&
      obstacleX + squareSize > obstacle.x
    const intersectsY =
      obstacleY < obstacle.y + obstacle.height &&
      obstacleY + squareSize > obstacle.y

    return intersectsX && intersectsY
  }

  // Проверка для треугольных объектов
  if (obstacle.type === 'mountain' && obstacle.triangleVertices) {
    const [tx1, ty1, tx2, ty2, tx3, ty3] = obstacle.triangleVertices

    // Проверяем, пересекается ли хотя бы одна вершина квадрата с треугольником
    const corners = [
      [obstacleX, obstacleY],
      [obstacleX + squareSize, obstacleY],
      [obstacleX, obstacleY + squareSize],
      [obstacleX + squareSize, obstacleY + squareSize],
    ]

    for (const [cx, cy] of corners) {
      if (isPointInTriangle(cx, cy, tx1, ty1, tx2, ty2, tx3, ty3)) {
        return true
      }
    }
  }

  return false
}
const isPointInTriangle = (
  px: number,
  py: number,
  tx1: number,
  ty1: number,
  tx2: number,
  ty2: number,
  tx3: number,
  ty3: number
) => {
  const area =
    0.5 *
    (-ty2 * tx3 + tx1 * (-ty2 + ty3) + tx2 * (ty1 - ty3) + tx3 * (ty2 - ty1))
  const sign = area < 0 ? -1 : 1
  const s = (ty1 * tx3 - tx1 * ty3 + (ty3 - ty1) * px + (tx1 - tx3) * py) * sign
  const t = (tx1 * ty2 - ty1 * tx2 + (ty1 - ty2) * px + (tx2 - tx1) * py) * sign

  return s >= 0 && t >= 0 && s + t <= area * 2 * sign
}

export const generateObstacle = (
  isPlaying: boolean,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  obstacles: React.MutableRefObject<TObstacle>
) => {
  if (!isPlaying) return
  const canvasWidth = canvasRef.current!.width
  const canvasHeight = canvasRef.current!.height
  const buildingCount = obstacles.current.filter(
    (o) => o.type === 'building'
  ).length

  const buildingSize =
    (buildingCount + 1) % 3 === 0 ? canvasHeight / 3 : 75 + Math.random() * 75

  const mountainSize =
    (buildingCount + 1) % 3 === 0 ? canvasHeight / 3 : 75 + Math.random() * 75

  const fromTop = Math.random() > 0.5
  const type = Math.random() > 0.5 ? 'mountain' : 'building'

  const size = type === 'mountain' ? mountainSize : buildingSize
  const y = fromTop ? 0 : canvasHeight - size

  obstacles.current.push({
    x: canvasWidth,
    y,
    width: size,
    height: size,
    type,
    fromTop,
  })
}
export const IMAGES_BACKGROUND = [
  IMG_BACKGROUND_1,
  IMG_BACKGROUND_2,
  IMG_BACKGROUND_3,
]
export const IMAGES_MODEL = [
  IMG_MODEL_PENIS,
  IMG_MODEL_PLANE,
  IMG_MODEL_SUPER_HERO_DAR,
  IMG_MODEL_ROCKET,
  IMG_MODEL_MAN,
]
export const IMAGES_OBSTACLES = [
  IMG_BUILDING_1,
  IMG_BUILDING_2,
  IMG_MOUNTAIN_1,
  IMG_LINE,
  IMG_COMET,
  IMG_ROOSTER,
]
