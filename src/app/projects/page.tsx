"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ProjectCard from "./components/ProjectCard";
import ProjectCount from "./components/ProjectCount";
import FilterSidebar from "./components/FilterSidebar";
import projectsImage from "../../../public/images/projects.webp";

// Static Assets
import projectData from "@/asset/projects.json";
import upcomingProjectData from "@/asset/upcomingProjects.json";
import contributorsData from "@/asset/contributors.json";
import contributorMapping from "@/asset/contributor-mapping.json";
import leaderboardData from "@/asset/leaderboard.json";
import {
  Project,
  Filters,
  ContributorMap,
  ContributorProject,
  TopScorer,
} from "../../types";
import {
  CURRENT_PROJECTS,
  PROJECTS_HEROZ,
  UPCOMING_PROJECTS,
} from "@/constants";

export default function ProjectsPage() {
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

  const typedMapping = contributorMapping as ContributorMap;

  const topScorers = leaderboardData.leaderboard as TopScorer[];

  // Enrich contributors with total_score from leaderboard, sorted highest first
  const enrichedContributors = useMemo((): ContributorProject[] => {
    return (contributorsData as unknown as ContributorProject[])
      .map((contributor) => {
        const match = topScorers.find(
          (s) => s.username.toLowerCase() === contributor.login.toLowerCase()
        );
        return { ...contributor, total_score: match?.total_score ?? 0 };
      })
      .sort((a, b) => (b.total_score ?? 0) - (a.total_score ?? 0));
  }, []);

  // Extract unique tags and technologies from BOTH current and upcoming projects
  const { allTags, allTechnologies } = useMemo(() => {
    const tagsSet = new Set<string>();
    const techSet = new Set<string>();

    const allProjects = [
      ...(projectData as Project[]),
      ...(upcomingProjectData as Project[]),
    ];

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

  // Filter projects
  const filterProjects = (projects: Project[]) => {
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
        const stars = project.stars || 0;
        if (stars < minStars) return false;
      }

      if (filters.contributorRange !== "all") {
        const minContributors = parseInt(
          filters.contributorRange.replace("+", ""),
          10
        );
        const contributorCount = Object.values(typedMapping).filter(
          (projectIds) => projectIds.includes(project.id)
        ).length;
        if (contributorCount < minContributors) return false;
      }

      if (filters.selectedContributor.length > 0) {
        const hasAllContributors = filters.selectedContributor.every(
          (login) => {
            const projectIds = typedMapping[login] || [];
            return projectIds.includes(project.id);
          }
        );
        if (!hasAllContributors) return false;
      }

      return true;
    });
  };

  const filteredCurrentProjects = useMemo(() => {
    return filterProjects(projectData as Project[]);
  }, [filters, searchQuery, typedMapping]);

  const filteredUpcomingProjects = useMemo(() => {
    return filterProjects(upcomingProjectData as Project[]);
  }, [filters, searchQuery, typedMapping]);

  const sortedCurrentProjects = useMemo(() => {
    const sorted = [...filteredCurrentProjects];

    switch (filters.sortBy) {
      case "activity":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.lastPushedAt || 0).getTime();
          const dateB = new Date(b.lastPushedAt || 0).getTime();
          return dateB - dateA;
        });
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
  }, [filteredCurrentProjects, filters.sortBy]);

  const sortedUpcomingProjects = useMemo(() => {
    const sorted = [...filteredUpcomingProjects];

    switch (filters.sortBy) {
      case "activity":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.lastPushedAt || 0).getTime();
          const dateB = new Date(b.lastPushedAt || 0).getTime();
          return dateB - dateA;
        });
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
  }, [filteredUpcomingProjects, filters.sortBy]);

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

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ← kept this useEffect because it handles hash-based scroll on page load
  // which is a genuine browser-side concern, not data fetching
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        scrollToSection(hash);
      }, 100);
    }
  }, []);

  return (
    <>
      <section className='bg-slate-50'>
        <div className='flex flex-col lg:flex-row justify-between lg:p-6 lg:px-10'>
          <div className='px-8 lg:basis-2/5 py-16 lg:pl-0'>
            <h1 className='text-4xl leading-10 md:text-5xl max-w-lg md:!leading-[3.5rem] tracking-wide text-mindfire-text-black'>
              {PROJECTS_HEROZ.heading}
            </h1>
            <p className='mt-6 text-xl text-mf-light-grey tracking-wide'>
              {PROJECTS_HEROZ.subheading}
            </p>
            <div className='flex flex-wrap items-start gap-6 mt-10'>
              <Link
                href='#current-projects'
                className='bg-mf-red text-center text-white tracking-widest capitalize rounded-full px-8 py-3'
              >
                {PROJECTS_HEROZ.ctaLabel}
              </Link>
            </div>
          </div>
          <Image
            src={projectsImage}
            alt='projects'
            className='max-lg:w-full object-contain'
            height='500'
            width='600'
            priority
          />
        </div>
      </section>

      <section className='mt-10 mb-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div id='current-projects' className='mb-8'>
            <div className='flex justify-center items-center gap-4'>
              <h2 className='text-2xl font-semibold tracking-wide text-mindfire-text-black ml-0 lg:ml-72'>
                {PROJECTS_HEROZ.currProject}
              </h2>
              <ProjectCount totalProjects={sortedCurrentProjects.length} />
            </div>
          </div>

          <div className='flex flex-col lg:flex-row gap-6 items-start'>
            <aside className='lg:w-72 flex-shrink-0 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto'>
              <FilterSidebar
                allTags={allTags}
                allTechnologies={allTechnologies}
                contributors={enrichedContributors}
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isMobileOpen={isMobileFilterOpen}
                onMobileToggle={() =>
                  setIsMobileFilterOpen(!isMobileFilterOpen)
                }
              />
            </aside>

            <main className='flex-1 min-w-0'>
              <div className='mb-16'>
                {sortedCurrentProjects.length === 0 ? (
                  <div className='text-center py-12'>
                    <p className='text-lg text-gray-500'>
                      {CURRENT_PROJECTS.emptyMessage}
                    </p>
                  </div>
                ) : (
                  <div className='grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
                    {sortedCurrentProjects.map((project) => (
                      <ProjectCard
                        key={project.id}
                        title={project.title}
                        parentTitle='Current Projects'
                        shortDescription={project.short_description}
                        githubUrl={project.github_repository_link}
                        documentationUrl={project.documentation_link}
                        stars={project.stars || 0}
                        tags={project.tags || []}
                      />
                    ))}
                  </div>
                )}
              </div>
            </main>
          </div>

          <div id='upcoming-projects' className='mt-16 mb-8'>
            <div className='flex justify-center items-center gap-4'>
              <h2 className='text-2xl font-semibold tracking-wide text-mindfire-text-black ml-0 lg:ml-72'>
                {UPCOMING_PROJECTS.heading}
              </h2>
              <ProjectCount totalProjects={sortedUpcomingProjects.length} />
            </div>
          </div>

          <div className='flex flex-col lg:flex-row gap-6 items-start'>
            <div className='lg:w-72 flex-shrink-0'></div>

            <main className='flex-1 min-w-0'>
              {sortedUpcomingProjects.length === 0 ? (
                <div className='text-center py-12'>
                  <p className='text-lg text-gray-500'>
                    {UPCOMING_PROJECTS.emptyMessage}
                  </p>
                </div>
              ) : (
                <div className='grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
                  {sortedUpcomingProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      title={project.title}
                      parentTitle='Upcoming Projects'
                      shortDescription={project.short_description}
                      githubUrl={project.github_repository_link}
                      documentationUrl={project.documentation_link}
                      stars={project.stars || 0}
                      tags={project.tags || []}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </>
  );
}
