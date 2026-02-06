"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ProjectCard from "./components/ProjectCard";
import ProjectCount from "./components/ProjectCount";
import FilterSidebar from "./components/FilterSidebar";
import projectsImage from "../../../public/images/projects.webp";

// Static Assets
import projectData from "./assets/projects.json";
import upcomingProjectData from "./assets/upcomingProjects.json";
import contributorsData from "./assets/contributors.json";
import contributorMapping from "./assets/contributor-mapping.json";
import { Project, Filters, ContributorMap } from "../../types";

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

  // 1. Extract unique tags and technologies from BOTH current and upcoming projects
  const { allTags, allTechnologies } = useMemo(() => {
    const tagsSet = new Set<string>();
    const techSet = new Set<string>();

    // Combine both project arrays
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

  // 2. Filter projects using STATIC mapping
  const filterProjects = (projects: Project[]) => {
    return projects.filter((project) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          project.title.toLowerCase().includes(query) ||
          project.short_description.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Tags/Tech filters...
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

      // Star range
      if (filters.starRange !== "all") {
        const stars = project.stars || 0;
        if (filters.starRange === "10+" && stars < 10) return false;
        if (filters.starRange === "50+" && stars < 50) return false;
        if (filters.starRange === "100+" && stars < 100) return false;
        if (filters.starRange === "500+" && stars < 500) return false;
      }

      // STATIC Contributor Filter
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
    if (filters.sortBy === "stars") {
      return sorted.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
    } else if (filters.sortBy === "name") {
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
  }, [filteredCurrentProjects, filters.sortBy]);

  const sortedUpcomingProjects = useMemo(() => {
    const sorted = [...filteredUpcomingProjects];
    if (filters.sortBy === "stars") {
      return sorted.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
    } else if (filters.sortBy === "name") {
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    }
    return sorted;
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

  // Handle scroll on page load if there's a hash in the URL
  useEffect(() => {
    const hash = window.location.hash.slice(1); // Remove the '#' character
    if (hash) {
      // Small delay to ensure the DOM is fully rendered
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
              Discover Amazing Open Source Projects
            </h1>
            <p className='mt-6 text-xl text-mf-light-grey tracking-wide'>
              Explore our collection of innovative open source projects.
            </p>
            <div className='flex flex-wrap items-start gap-6 mt-10'>
              <Link
                href='#current-projects'
                className='bg-mf-red text-center text-white tracking-widest capitalize rounded-full px-8 py-3'
              >
                Browse Projects
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
          {/* Move headings OUTSIDE the flex container */}
          <div id='current-projects' className='mb-8'>
            <div className='flex justify-center items-center gap-4'>
              <h2 className='text-2xl font-semibold tracking-wide text-mindfire-text-black ml-0 lg:ml-72'>
                Current Projects
              </h2>
              <ProjectCount totalProjects={sortedCurrentProjects.length} />
            </div>
          </div>

          <div className='flex flex-col lg:flex-row gap-6 items-start'>
            {/* Sticky Sidebar - now aligns with cards */}
            <aside className='lg:w-72 flex-shrink-0 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto'>
              <FilterSidebar
                allTags={allTags}
                allTechnologies={allTechnologies}
                contributors={contributorsData}
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

            {/* Main Content Area - Cards */}
            <main className='flex-1 min-w-0'>
              {/* Current Projects Grid */}
              <div className='mb-16'>
                {sortedCurrentProjects.length === 0 ? (
                  <div className='text-center py-12'>
                    <p className='text-lg text-gray-500'>
                      No current projects found.
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

          {/* Upcoming Projects Section - Full Width Heading */}
          <div id='upcoming-projects' className='mt-16 mb-8'>
            <div className='flex justify-center items-center gap-4'>
              <h2 className='text-2xl font-semibold tracking-wide text-mindfire-text-black ml-0 lg:ml-72'>
                Upcoming Projects
              </h2>
              <ProjectCount totalProjects={sortedUpcomingProjects.length} />
            </div>
          </div>

          {/* Upcoming Projects Grid - aligned with sidebar */}
          <div className='flex flex-col lg:flex-row gap-6 items-start'>
            {/* Spacer to match sidebar width */}
            <div className='lg:w-72 flex-shrink-0'></div>

            {/* Upcoming Projects Content */}
            <main className='flex-1 min-w-0'>
              {sortedUpcomingProjects.length === 0 ? (
                <div className='text-center py-12'>
                  <p className='text-lg text-gray-500'>
                    No upcoming projects found.
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
