import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState } from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./components/ui/drawer";
import { useCanvasGame } from "./hooks/useCanvasGame";
import { Button } from "@/components/ui/button";

import {
  IMAGES_BACKGROUND,
  IMAGES_MODEL,
  IMAGES_OBSTACLE_SETS,
} from "./lib/images";

export default function App() {
  const [gameStatus, setGameStatus] = useState<
    "idle" | "playing" | "paused" | "lost"
  >("idle");
  const [activeBgIndex, setActiveBgIndex] = useState(0);
  const [activeModelIndex, setActiveModelIndex] = useState(0);
  const [activeObsIndex, setActiveObsIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [showHint, setShowHint] = useState(true);

  const closeHint = () => {
    setShowHint(false);
    setIsPlaying(true);
  };

  const onGameOver = () => setIsPlaying(false);

  const { canvasRef, handleClick } = useCanvasGame({
    activeBgIndex,
    activeModelIndex,
    activeObsIndex,
    isPlaying,
    setIsPlaying,
    onGameOver,
    setGameStatus,
  });
  const handleGame = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setGameStatus("paused");
    } else {
      setIsPlaying(true);
      setGameStatus("playing");
    }
  };
  const imageBackgrounds = IMAGES_BACKGROUND;
  const imageModels = IMAGES_MODEL;
  const imageObstacles = IMAGES_OBSTACLE_SETS;

  return (
    <div className="relative h-full w-full">
      {!showHint && gameStatus === "paused" && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white">
          <div className="text-3xl mb-4">Game Paused ⏸️</div>
          <Button
            className="bg-white text-black hover:bg-gray-200"
            onClick={() => {
              setGameStatus("playing");
              setIsPlaying(true);
            }}
          >
            Resume
          </Button>
        </div>
      )}

      {!showHint && gameStatus === "lost" && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white">
          <div className="text-3xl mb-4">You Lost 😢</div>
          <Button
            className="bg-white text-black hover:bg-gray-200"
            onClick={() => {
              setGameStatus("playing");
              setIsPlaying(true);
            }}
          >
            Try again
          </Button>
        </div>
      )}
      {showHint && (
        <div>
          <div
            className="fixed z-50 top-20 left-1/2 transform -translate-x-1/2 bg-white border border-gray-400 rounded-lg p-4 max-w-md shadow-lg z-50"
            role="alert"
            aria-live="assertive"
          >
            <h2 className="text-lg font-semibold mb-2">How to play</h2>
            <p className="mb-4">
              Tap the screen (or press the spacebar) to make the character jump
              and avoid obstacles. Don’t let it fall or crash!
            </p>
            <button
              onClick={closeHint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Got it
            </button>
          </div>
          <img className="h-screen" src={imageBackgrounds[0]} alt="hind-img" />
        </div>
      )}

      <canvas
        className="absolute top-0 left-0 cursor-pointer"
        ref={canvasRef}
        onClick={handleClick}
      />

      <div className="flex justify-center z-50 items-center gap-3 absolute top-4 right-4">
        <Button variant="secondary" onClick={handleGame}>
          {isPlaying ? "Stop" : "Start"}
        </Button>

        <Drawer
          onOpenChange={() => {
            setIsPlaying(false);
            setGameStatus("paused");
          }}
        >
          <DrawerTrigger asChild>
            <Button variant="secondary">Menu</Button>
          </DrawerTrigger>

          <DrawerContent className="h-fit">
            <DrawerHeader>
              <DrawerTitle>Choose your background and character</DrawerTitle>
            </DrawerHeader>

            <div className="flex flex-col items-center divide-y-2 gap-4">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                activeIndex={activeBgIndex}
                setActiveIndex={setActiveBgIndex}
                className="max-w-xl"
              >
                <CarouselContent>
                  {imageBackgrounds.map((src, i) => (
                    <CarouselItem
                      className="flex items-center justify-center"
                      key={i}
                    >
                      <img
                        className="min-h-40 select-none object-cover rounded-xl"
                        src={src}
                        alt={`Background ${i}`}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>

              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                activeIndex={activeModelIndex}
                setActiveIndex={setActiveModelIndex}
                className="max-w-xl"
              >
                <CarouselContent>
                  {imageModels.map((src, i) => (
                    <CarouselItem
                      className="flex items-center justify-center"
                      key={i}
                    >
                      <img
                        className="h-40 select-none"
                        src={src}
                        alt={`Model ${i}`}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                activeIndex={activeObsIndex}
                setActiveIndex={setActiveObsIndex}
                className="max-w-xl"
              >
                <CarouselContent>
                  {imageObstacles.map((set, i) => (
                    <CarouselItem key={i} className="flex gap-2 justify-center">
                      {set.map((src, j) => (
                        <img
                          key={j}
                          className="h-24 rounded"
                          src={src}
                          alt={`Obstacle ${j}`}
                        />
                      ))}
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>

            <DrawerFooter>
              <div className="ml-auto">
                <DrawerClose>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
