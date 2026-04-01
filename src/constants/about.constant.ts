// ── About Page ────────────────────────────────────────────────────────────────

import { SectionData } from "@/types";

export const ABOUT_HERO = {
  heading: "Where Innovation Knows no Boundaries.",
  subheading:
    "We code, we collaborate, and together we create open source wonders.",
  exploreLabel: "explore projects",
  contactLabel: "contact us",
  contactHref: "https://www.mindfiresolutions.com/contact-us/",
} as const;

export const ABOUT_MISSION = {
  title: "our mission",
  description:
    "Our mission is to collaborate with the open source community, ignite creativity, share knowledge, and develop solutions that drive positive global change.",
} as const;

export const ABOUT_WHY_OPEN_SOURCE = {
  title: "why open source?",
  description:
    "Open source fuels collaboration, transparency, and perpetual advancement, inspiring innovation and fostering a culture of shared knowledge and growth.",
} as const;

export const ABOUT_CONTRIBUTIONS = {
  title: "Our Contributions",
  description:
    "Explore our growing list of open source projects, ranging from software libraries and frameworks to tools and utilities. We are committed to actively contributing to these projects and maintaining a strong presence in the open source ecosystem.",
  exploreLabel: "Explore projects",
} as const;

export const MISSION_SECTION_DATA: SectionData[] = [
  {
    title: "collaborative creativity",
    description:
      " Fostering a culture of collaboration and creativity where diverse minds come together to innovate.",
  },
  {
    title: "knowledge sharing",
    description:
      "Sharing knowledge openly and freely, enabling continuous learning and growth within our community.",
  },
  {
    title: "positive global impact",
    description:
      "Building open source solutions that address real-world challenges and bring about positive change on a global scale",
  },
];

export const WHY_OPEN_SOURCE_SECTION_DATA: SectionData[] = [
  {
    title: "Collaboration",
    description:
      "Embracing the power of collective effort to drive progress and create better solutions",
  },
  {
    title: "Transparency",
    description:
      "Promoting openness and clarity, ensuring trust and shared understanding in our work",
  },
  {
    title: "Innovation",
    description:
      "Sparking creativity and new ideas, pushing boundaries, and evolving through shared knowledge and learning",
  },
];
