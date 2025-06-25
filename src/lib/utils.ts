import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
export const createImage = (src: string): HTMLImageElement => {
  const img = new Image();
  img.src = src;
  return img;
};
