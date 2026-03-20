// ── Join Us Page ──────────────────────────────────────────────────────────────

import { SectionData } from "@/types";

export const JOIN_US_HERO = {
  heading: "Eager to Contribute to Open Source Ecosystems",
  subheading:
    "Explore projects and start working, or discover our beginner-friendly open source checklist to learn more.",
  ctaLabel: "explore projects",
  imageAlt: "Join Us",
} as const;

export const JOIN_US_GETTING_STARTED = {
  title: "getting started with",
  description: "Here's a simple guide to help you navigate your way.",
} as const;

export const joinUsGetStartSectionData: SectionData[] = [
  {
    title: "Create a GitHub account",
    description:
      "Projects are hosted on GitHub, requiring a GitHub account for contributions through issue submissions and pull requests.",
  },
  {
    title: "Find a project",
    description:
      "From web and mobile to AI and machine learning, we have diverse projects. Please visit our Projects page to explore.",
  },
  {
    title: "Read the docs",
    description:
      "GitHub repos include README with project info and optional website links. Some projects use Docusaurus for docs.",
  },
  {
    title: "Submit your first pull request",
    description:
      "You're all set to begin contributing! Explore this GitHub guide to understand pull requests, a way to notify others about your repository changes.",
  },
];
