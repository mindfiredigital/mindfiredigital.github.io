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
  total_score?: number;
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

export interface UpcomingProjectsSectionProps {
  projects: Project[];
}

export interface TechnologyFilterProps {
  technologies: string[];
  selected: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (tech: string) => void;
}

export interface TagsFilterProps {
  tags: string[];
  selected: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (tag: string) => void;
}

export interface StarsFilterProps {
  value: string;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}

export interface SortByFilterProps {
  value: string;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}

export interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export interface FilterSidebarHeaderProps {
  activeFiltersCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  onMobileToggle: () => void;
}

export interface CurrentProjectsSectionProps {
  projects: Project[];
}

export interface ContributorsFilterProps {
  contributors: ContributorProject[];
  selected: string[];
  isExpanded: boolean;
  onToggle: () => void;
  onSelect: (login: string) => void;
  onClearAll: () => void;
}

export interface ContributorsCountFilterProps {
  value: string;
  isExpanded: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}
