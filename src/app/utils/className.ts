import clsx from "clsx";
import { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/* Utility function to combine class names safely when using Tailwind CSS */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
