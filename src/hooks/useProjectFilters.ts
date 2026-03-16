import { useState, useMemo } from "react";
import {
  Filters,
  Project,
  ContributorProject,
  TopScorer,
  ContributorMap,
} from "@/types";

// Encapsulates all filter state, sort logic, and derived project lists
// Returns everything the page needs to render filtered/sorted projects
export function useProjectFilters(
  projectData: Project[],
  upcomingProjectData: Project[],
  contributorsData: ContributorProject[],
  contributorMapping: ContributorMap,
  topScorers: TopScorer[]
) {
  const [filters, setFilters] = useState<Filters>({
    tags: [],
    technologies: [],
    starRange: "all",
    contributorRange: "all",
    selectedContributor: [],
    sortBy: "stars",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Enrich contributors with total_score from leaderboard, sorted highest first
  const enrichedContributors = useMemo((): ContributorProject[] => {
    return contributorsData
      .map((contributor) => {
        const match = topScorers.find(
          (s) => s.username.toLowerCase() === contributor.login.toLowerCase()
        );
        return { ...contributor, total_score: match?.total_score ?? 0 };
      })
      .sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0));
  }, []);

  // Extract unique tags and technologies from both current and upcoming projects
  const { allTags, allTechnologies } = useMemo(() => {
    const tagsSet = new Set<string>();
    const techSet = new Set<string>();

    const allProjects = [...projectData, ...upcomingProjectData];

    allProjects.forEach((project) => {
      project.tags?.forEach((tag) => {
        const lowerTag = tag.toLowerCase();
        if (
          [
            "react",
            "vue",
            "angular",
            "typescript",
            "javascript",
            "python",
            "node.js",
            "next.js",
            "svelte",
            "tailwind",
            "css",
            "html",
          ].includes(lowerTag)
        ) {
          techSet.add(tag);
        } else {
          tagsSet.add(tag);
        }
      });
    });

    return {
      allTags: Array.from(tagsSet).sort(),
      allTechnologies: Array.from(techSet).sort(),
    };
  }, []);

  // Core filter logic applied to any project list
  const filterProjects = (projects: Project[]): Project[] => {
    return projects.filter((project) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          project.title.toLowerCase().includes(query) ||
          project.short_description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (filters.tags.length > 0) {
        const hasTag = filters.tags.some(
          (tag) =>
            project.tags?.some(
              (pTag) => pTag.toLowerCase() === tag.toLowerCase()
            )
        );
        if (!hasTag) return false;
      }

      if (filters.technologies.length > 0) {
        const hasTech = filters.technologies.some(
          (tech) =>
            project.tags?.some(
              (pTag) => pTag.toLowerCase() === tech.toLowerCase()
            )
        );
        if (!hasTech) return false;
      }

      if (filters.starRange !== "all") {
        const minStars = parseInt(filters.starRange.replace("+", ""), 10);
        if ((project.stars || 0) < minStars) return false;
      }

      if (filters.contributorRange !== "all") {
        const minContributors = parseInt(
          filters.contributorRange.replace("+", ""),
          10
        );
        const contributorCount = Object.values(contributorMapping).filter(
          (projectIds) => projectIds.includes(project.id)
        ).length;
        if (contributorCount < minContributors) return false;
      }

      if (filters.selectedContributor.length > 0) {
        const hasAllContributors = filters.selectedContributor.every(
          (login) => {
            const projectIds = contributorMapping[login] || [];
            return projectIds.includes(project.id);
          }
        );
        if (!hasAllContributors) return false;
      }

      return true;
    });
  };

  // Sort logic applied to any filtered project list
  const sortProjects = (projects: Project[]): Project[] => {
    const sorted = [...projects];
    switch (filters.sortBy) {
      case "activity":
        return sorted.sort(
          (a, b) =>
            new Date(b.lastPushedAt || 0).getTime() -
            new Date(a.lastPushedAt || 0).getTime()
        );
      case "stars":
        return sorted.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
      case "name":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.date_created).getTime() -
            new Date(a.date_created).getTime()
        );
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.date_created).getTime() -
            new Date(b.date_created).getTime()
        );
      default:
        return sorted;
    }
  };

  const sortedCurrentProjects = useMemo(
    () => sortProjects(filterProjects(projectData)),
    [filters, searchQuery]
  );

  const sortedUpcomingProjects = useMemo(
    () => sortProjects(filterProjects(upcomingProjectData)),
    [filters, searchQuery]
  );

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      tags: [],
      technologies: [],
      starRange: "all",
      contributorRange: "all",
      selectedContributor: [],
      sortBy: "stars",
    });
    setSearchQuery("");
  };

  return {
    filters,
    searchQuery,
    setSearchQuery,
    isMobileFilterOpen,
    setIsMobileFilterOpen,
    enrichedContributors,
    allTags,
    allTechnologies,
    sortedCurrentProjects,
    sortedUpcomingProjects,
    handleFilterChange,
    handleResetFilters,
  };
}
