import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './components/ui/drawer'
import {
  IMAGES_BACKGROUND,
  IMAGES_MODEL,
  IMAGES_OBSTACLES,
  checkCollision,
  generateObstacle,
} from './lib/utils'

import IMG_BACKGROUND from '@/assets/be454f2d-02f9-4e51-a1b7-942189723a7e.jpg'
import IMG_BUILDING from '@/assets/building-town-svgrepo-com.svg'
import IMG_MOUNTAIN from '@/assets/mountain-svgrepo-com.svg'
import IMG_MODEL from '@/assets/penis-svgrepo-com.svg'
import { Button } from '@/components/ui/button'

export type TObstacle = Array<{
  x: number
  y: number
  width: number
  height: number
  type: 'mountain' | 'building'
  fromTop: boolean
}>
export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const requestRef = useRef<number>()
  const posY = useRef(0) // Позиция по оси Y модели
  const speedY = useRef(0) // Начальная скорость модели
  const gravity = 0.8 // Гравитация (ускорение)
  const squareSize = 50 // Размер модели
  const squareSpeed = 1 // Скорость движения фона
  const backgroundX = useRef(0) // Начальная позиция фона
  const angleRef = useRef(0) // Текущий угол поворота
  const targetAngleRef = useRef(0) // Целевой угол поворота
  const rotationSpeed = 0.05
  const obstacleInterval = useRef<ReturnType<typeof setInterval> | null>(null)
  const obstacles = useRef<TObstacle>([])
  const imgBackground = useRef<HTMLImageElement>(new Image()) // Ссылка на изображение фона
  const imgModel = useRef<HTMLImageElement>(new Image()) // Ссылка на изображение модели
  const imgMountain = useRef<HTMLImageElement>(new Image()) // Ссылка на изображение модели
  const imgBuilding = useRef<HTMLImageElement>(new Image()) // Ссылка на изображение модели
  const [isPlaying, setIsPlaying] = useState(true) // Состояние игры (играет/остановлена)
  const [imageModels] = useState<string[]>(IMAGES_MODEL)
  const [imageBackgrounds] = useState<string[]>(IMAGES_BACKGROUND)
  const [imageObstacles] = useState<string[]>(IMAGES_OBSTACLES)

  const handleGameOver = useCallback(() => {
    posY.current = canvasRef.current!.height / 2
    speedY.current = 0 // Останавливаем падение
    setIsPlaying(false) // Останавливаем игру
    console.log('Ты проиграл лошара ебаная') // Показываем сообщение
    if (obstacleInterval.current) clearInterval(obstacleInterval.current)
    obstacleInterval.current = null // Сбрасываем интервал
  }, [obstacleInterval])

  // Функция для рисования препятствий
  const drawObstacles = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      obstacles.current.forEach((obstacle) => {
        if (!imgMountain.current || !imgBuilding.current) {
          console.error('Images not loaded')
          return
        }

        ctx.save()
        const img =
          obstacle.type === 'mountain'
            ? imgMountain.current
            : imgBuilding.current

        const path = new Path2D()
        if (obstacle.type === 'mountain') {
          if (obstacle.fromTop) {
            path.moveTo(obstacle.x, obstacle.y)
            path.lineTo(obstacle.x + obstacle.width, obstacle.y)
            path.lineTo(
              obstacle.x + obstacle.width / 2,
              obstacle.y - obstacle.height
            )
          } else {
            path.moveTo(obstacle.x, obstacle.y + obstacle.height)
            path.lineTo(
              obstacle.x + obstacle.width,
              obstacle.y + obstacle.height
            )
            path.lineTo(obstacle.x + obstacle.width / 2, obstacle.y)
          }
        }
        // Прямоугольная форма для зданий
        else path.rect(obstacle.x, obstacle.y, obstacle.width, obstacle.height)

        path.closePath()
        ctx.strokeStyle = 'blue' // Сделайте ее синим для видимости
        ctx.lineWidth = 1
        ctx.stroke(path)
        // Применяем обрезку (clipping) к форме препятствия
        ctx.clip(path)
        ctx.translate(
          obstacle.x + obstacle.width / 2,
          obstacle.y + obstacle.height / 2
        )

        if (obstacle.fromTop) ctx.rotate(Math.PI) // Вращаем на 180 градусов, если необходимо

        // Восстанавливаем позицию для отрисовки
        ctx.translate(-obstacle.width / 2, -obstacle.height / 2)

        // Рисуем изображение
        ctx.drawImage(img, 0, 0, obstacle.width, obstacle.height)

        ctx.restore()

        obstacle.x -= squareSpeed
        if (checkCollision(obstacle, canvasRef, squareSize, posY)) {
          handleGameOver()
          return
        }
        // Удаляем препятствия, которые вышли за экран
        if (obstacle.x + obstacle.width < 0)
          obstacles.current = obstacles.current.filter((o) => o !== obstacle)
      })
    },
    [handleGameOver]
  )

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height) // Очищаем canvas

      // Рисуем фон на новой позиции
      ctx.drawImage(
        imgBackground.current,
        backgroundX.current,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      )
      ctx.drawImage(
        imgBackground.current,
        backgroundX.current + ctx.canvas.width,
        0,
        ctx.canvas.width,
        ctx.canvas.height
      )
      drawObstacles(ctx)
      if (Math.random() < 0.01) {
        generateObstacle(isPlaying, canvasRef, obstacles)
      }
      // Перемещаем фон влево
      backgroundX.current -= squareSpeed

      // Если фон полностью вышел за левую границу, сбрасываем его позицию
      if (backgroundX.current <= -ctx.canvas.width) {
        backgroundX.current = 0
      }

      // Вычисляем центр экрана по Y

      // Логика падения квадрата
      posY.current += speedY.current // Меняем позицию по Y
      speedY.current += gravity // Увеличиваем скорость падения под действием гравитации

      // Проверка на проигрыш, если квадрат касается верхней или нижней границы
      if (posY.current > ctx.canvas.height - squareSize) {
        posY.current = ctx.canvas.height - squareSize
        speedY.current = 0 // Останавливаем падение
        setIsPlaying(false) // Останавливаем игру
        console.log('Ты проиграл , ты что еблан за границы не заходи') // Показываем сообщение
        if (obstacleInterval.current) clearInterval(obstacleInterval.current)
      } else if (posY.current < 0) {
        posY.current = 0
        speedY.current = 0 // Останавливаем движение вверх
        setIsPlaying(false) // Останавливаем игру
        console.log('Ты проиграл , ты что еблан за границы не заходи') // Показываем сообщении
        if (obstacleInterval.current) clearInterval(obstacleInterval.current)
      }

      // Определяем целевой угол поворота
      const targetAngle =
        speedY.current > 0 ? (200 * Math.PI) / 200 : (10 * Math.PI) / 200 // 120 и 80 градусов в радианах
      targetAngleRef.current = targetAngle

      // Плавно изменяем текущий угол
      const angleDiff = targetAngleRef.current - angleRef.current
      if (Math.abs(angleDiff) > rotationSpeed) {
        angleRef.current += Math.sign(angleDiff) * rotationSpeed
      } else {
        angleRef.current = targetAngleRef.current
      }

      // Рисуем модельку с учетом поворота
      ctx.save() // Сохраняем текущее состояние

      // Перемещаем начало координат в центр модели
      ctx.translate(ctx.canvas.width / 2, posY.current + squareSize / 2)

      // Поворачиваем на текущий угол
      ctx.rotate(angleRef.current)

      ctx.drawImage(
        imgModel.current,
        -squareSize / 2, // Сместить начало координат влево
        -squareSize / 2, // Сместить начало координат вверх
        squareSize,
        squareSize
      )
      ctx.restore()
    },
    [drawObstacles, isPlaying]
  )

  const handleGame = () => {
    if (isPlaying) handleGameOver()
    else {
      posY.current = canvasRef.current!.height / 2
      speedY.current = 0 // Останавливаем падение
      setIsPlaying(true) // Останавливаем игру
      console.log('еще раз') // Показываем сообщение
      if (obstacleInterval.current) clearInterval(obstacleInterval.current)
      obstacleInterval.current = null // Сбрасываем интервал
    }
  }
  const animate = useCallback(() => {
    if (isPlaying) {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (ctx) draw(ctx)
      requestRef.current = requestAnimationFrame(animate)
    }
  }, [draw, isPlaying])
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    imgBackground.current.src = IMG_BACKGROUND
    imgModel.current.src = IMG_MODEL
    imgBuilding.current.src = IMG_BUILDING
    imgMountain.current.src = IMG_MOUNTAIN
  }, [])
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(requestRef.current!) // Очищаем при размонтировании
  }, [animate])

  useEffect(() => {
    if (isPlaying) setInterval(generateObstacle, 2000)
    else if (obstacleInterval.current) clearInterval(obstacleInterval.current)

    return () => {
      if (obstacleInterval.current) clearInterval(obstacleInterval.current)
    }
  }, [isPlaying])
  return (
    <div className='relative'>
      <canvas
        className='absolute top-0 left-0 cursor-pointer '
        ref={canvasRef}
        onClick={() => (speedY.current = -10)}
      />
      <div className='flex justify-center items-center gap-3 absolute top-4 right-4'>
        <Button variant='secondary' onClick={handleGame}>
          {isPlaying ? 'Стоп' : 'Старт'}
        </Button>
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant='secondary'>Меню</Button>
          </DrawerTrigger>
          <DrawerContent className='h-fit'>
            <DrawerHeader>
              <DrawerTitle>Выбери себе фон и модельку</DrawerTitle>
            </DrawerHeader>
            <div className='flex flex-col items-center divide-y-2 gap-4'>
              <Carousel className='max-w-xl'>
                <CarouselContent>
                  {imageBackgrounds.map((src, i) => (
                    <CarouselItem
                      onClick={() => (imgBackground.current.src = src)}
                      key={i}>
                      <img className='rounded-lg' src={src} alt={src} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
              <Carousel className='max-w-xl'>
                <CarouselContent>
                  {imageModels.map((src, i) => (
                    <CarouselItem className='flex justify-center' key={i}>
                      <img
                        onClick={() => (imgModel.current.src = src)}
                        className=' h-40'
                        src={src}
                        alt={src}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
              <Carousel className='max-w-lg'>
                <CarouselContent>
                  {imageObstacles.map((src, i) => (
                    <CarouselItem className='flex justify-center' key={i}>
                      <img className='h-40' src={src} alt={src} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>

            <DrawerFooter>
              <div className=' ml-auto'>
                <Button>Поменять</Button>
                <DrawerClose>
                  <Button variant='outline'>Отменить</Button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  )
}
