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
import { ObstacleType, TObstacle } from '@/types/index.types'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
export const checkCollision = (
  obstacle: {
    x: number
    y: number
    width: number
    height: number
    type: 'mountain' | 'building' | 'lazer' | 'comet' | 'rooster'
    fromTop: boolean
  },
  canvasRef: React.RefObject<HTMLCanvasElement>,
  modelSize: number,
  modelPositionY: React.MutableRefObject<number>
) => {
  const { modelX, modelY } = getModelPosition(
    canvasRef,
    modelSize,
    modelPositionY
  )
  if (obstacle.type === 'building') {
    const intersectsX =
      modelX < obstacle.x + obstacle.width && modelX + modelSize > obstacle.x
    const intersectsY =
      modelY < obstacle.y + obstacle.height && modelY + modelSize > obstacle.y

    return intersectsX && intersectsY
  }

  if (obstacle.type === 'mountain') {
    let corners: Point[]
    // Проверка всех углов квадрата на пересечение с треугольником
    if (obstacle.fromTop)
      corners = [
        [obstacle.x, obstacle.y],
        [obstacle.x + obstacle.width, obstacle.y],
        [obstacle.x + obstacle.width / 2, obstacle.y - obstacle.height],
      ]
    else
      corners = [
        [obstacle.x, obstacle.y + obstacle.height],
        [obstacle.x + obstacle.width, obstacle.y + obstacle.height],
        [obstacle.x + obstacle.width / 2, obstacle.y],
      ]
    const modelCorners: Point[] = [
      [modelX, modelY],
      [modelX + modelSize, modelY],
      [modelX + modelSize, modelY + modelSize],
      [modelX, modelY + modelSize],
    ]
    const result = isRectangleIntersectingTriangle(modelCorners, corners)
    return result
  }

  return false
}
type Point = [number, number]
// Функция для проверки, пересекаются ли два отрезка
function doLineSegmentsIntersect(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point
): boolean {
  function ccw(a: Point, b: Point, c: Point): boolean {
    return (c[1] - a[1]) * (b[0] - a[0]) > (b[1] - a[1]) * (c[0] - a[0])
  }
  return (
    ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4)
  )
}

// Функция для проверки, находится ли точка внутри треугольника
function isPointInTriangle(
  px: number,
  py: number,
  tx1: number,
  ty1: number,
  tx2: number,
  ty2: number,
  tx3: number,
  ty3: number
): boolean {
  const d1 = (px - tx2) * (ty1 - ty2) - (tx1 - tx2) * (py - ty2)
  const d2 = (px - tx3) * (ty2 - ty3) - (tx2 - tx3) * (py - ty3)
  const d3 = (px - tx1) * (ty3 - ty1) - (tx3 - tx1) * (py - ty1)

  const hasNeg = d1 < 0 || d2 < 0 || d3 < 0
  const hasPos = d1 > 0 || d2 > 0 || d3 > 0

  return !(hasNeg && hasPos)
}

// Проверка пересечения прямоугольника с треугольником
function isRectangleIntersectingTriangle(
  rectCorners: Point[],
  triCorners: Point[]
): boolean {
  // Определение рёбер прямоугольника
  const rectEdges: [Point, Point][] = [
    [rectCorners[0], rectCorners[1]],
    [rectCorners[1], rectCorners[2]],
    [rectCorners[2], rectCorners[3]],
    [rectCorners[3], rectCorners[0]],
  ]

  // Определение рёбер треугольника
  const triEdges: [Point, Point][] = [
    [triCorners[0], triCorners[1]],
    [triCorners[1], triCorners[2]],
    [triCorners[2], triCorners[0]],
  ]

  // Проверка пересечения рёбер прямоугольника с рёбрами треугольника
  for (const [p1, p2] of rectEdges) {
    for (const [p3, p4] of triEdges) {
      if (doLineSegmentsIntersect(p1, p2, p3, p4)) {
        return true
      }
    }
  }

  // Проверка, находятся ли вершины прямоугольника внутри треугольника
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
        triCorners[2][1]
      )
    ) {
      return true
    }
  }

  // Проверка, находятся ли вершины треугольника внутри прямоугольника
  for (const [tx, ty] of triCorners) {
    if (
      tx >= rectCorners[0][0] &&
      tx <= rectCorners[2][0] &&
      ty >= rectCorners[0][1] &&
      ty <= rectCorners[2][1]
    ) {
      return true
    }
  }

  return false
}

const getModelPosition = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  modelSize: number,
  posY: React.MutableRefObject<number>
) => {
  const modelX = canvasRef.current!.width / 2 - modelSize / 2
  const modelY = posY.current

  return { modelX, modelY }
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
    (o) => o.type === ObstacleType.Building
  ).length

  // Размеры для различных типов
  const buildingSize =
    (buildingCount + 1) % 3 === 0 ? canvasHeight / 3 : 75 + Math.random() * 75

  const mountainSize =
    (buildingCount + 1) % 3 === 0 ? canvasHeight / 3 : 75 + Math.random() * 75

  // Определяем тип и размер препятствия
  const fromTop = Math.random() > 0.5
  const type = Object.values(ObstacleType)[
    Math.floor(Math.random() * Object.values(ObstacleType).length)
  ] as ObstacleType
  let size = 0
  switch (type) {
    case ObstacleType.Mountain:
      size = mountainSize
      break
    case ObstacleType.Building:
      size = buildingSize
      break
    case ObstacleType.Lazer:
      size = 50 + Math.random() * 50
      break
    case ObstacleType.Comet:
      size = 40 + Math.random() * 60
      break
    case ObstacleType.Rooster:
      size = 60 + Math.random() * 60
      break
  }

  const y = fromTop ? 0 : canvasHeight - size

  obstacles.current.push({
    x: canvasWidth,
    y: Math.round(y),
    width: Math.round(size),
    height: Math.round(size),
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
