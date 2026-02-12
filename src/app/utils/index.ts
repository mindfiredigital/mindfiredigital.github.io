import clsx from "clsx";
import { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export * from "./groupPackages";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
