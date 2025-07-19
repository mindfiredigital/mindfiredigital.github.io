import { StaticImageData } from "next/image";

export interface Navigation {
  name: string;
  path: string[];
  target?: string;
  icon?: string | StaticImageData;
  iconAlt?: string;
}
