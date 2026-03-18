import { Navigation } from "@/types";

export const HEADER = {
  projects: "Projects",
  currentProject: "Current Projects",
  upcomingProject: "Upcoming Projects",
  joinUs: "Join Us!",
  opneMainMenu: "Open main menu",
};

export const navigations: Navigation[] = [
  {
    name: "About",
    path: ["/about"],
  },
  {
    name: "Projects",
    path: ["/projects", "/current-projects", "/upcoming-projects"],
  },
  {
    name: "Contributors",
    path: ["/contributors"],
  },
  {
    name: "Packages",
    path: ["/packages"],
  },
  {
    name: "GitHub",
    path: ["https://github.com/mindfiredigital"],
    target: "_blank",
    icon: "/images/social-media/maximize.png",
    iconAlt: "redirect_icon",
  },
];
