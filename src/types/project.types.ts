export interface ProjectProps {
  title: string;
  parentTitle: string;
  shortDescription: string;
  githubUrl?: string;
  documentationUrl?: string;
  stars?: number;
  tags?: string[];
}

export interface ProjectCountProps {
  totalProjects: number;
}

export interface ProjectGridProps {
  title: string;
  projectData: {
    title: string;
    shortDescription: string;
    githubUrl?: string | undefined;
    documentationUrl?: string | undefined;
    id?: number | undefined;
    Summary?: string | undefined;
    project_type?: string | undefined;
    contributors?: string[] | undefined;
    project_goal?: string | undefined;
    target_users?: string | undefined;
    risk?: string | undefined;
    stars?: number;
    tags?: string[];
  }[];
}

// Define the Interface to match your JSON exactly
export interface Project {
  id: number;
  title: string;
  short_description: string;
  github_repository_link: string;
  documentation_link: string;
  project_type: string;
  stars?: number;
  tags?: string[];
  // If the JSON doesn't have it yet, we mark it optional
  contributors?: number;
  date_created: string; // Use string for ISO timestamps from JSON
  date_updated?: string | null;
  lastPushedAt?: string;
}

export interface Filters {
  tags: string[];
  technologies: string[];
  starRange: string;
  contributorRange: string;
  selectedContributor: string[];
  sortBy: string;
}

export type ContributorMap = Record<string, number[]>;

export interface ContributorProject {
  id: number;
  login: string;
  contributions: number;
  html_url: string;
  avatar_url: string;
}

export interface Filters {
  tags: string[];
  technologies: string[];
  starRange: string;
  contributorRange: string;
  selectedContributor: string[];
  sortBy: string;
}

export interface FilterSidebarProps {
  allTags: string[];
  allTechnologies: string[];
  contributors: ContributorProject[];
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  onReset: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isMobileOpen: boolean;
  onMobileToggle: () => void;
}
