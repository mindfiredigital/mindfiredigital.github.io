"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import ProjectCard from "./components/ProjectCard";
import ProjectCount from "./components/ProjectCount";
import FilterSidebar from "./components/FilterSidebar";
import projectsImage from "../../../public/images/projects.webp";

// Static Assets
import projectData from "./assets/projects.json";
import contributorsData from "./assets/contributors.json";
import contributorMapping from "./assets/contributor-mapping.json";

// Define the Interface to match your JSON exactly
interface Project {
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
}

interface Filters {
  tags: string[];
  technologies: string[];
  starRange: string;
  contributorRange: string;
  selectedContributor: string[];
}

type ContributorMap = Record<string, number[]>;

export default function ProjectsPage() {
  const [filters, setFilters] = useState<Filters>({
    tags: [],
    technologies: [],
    starRange: "all",
    contributorRange: "all",
    selectedContributor: [],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const typedMapping = contributorMapping as ContributorMap;

  // 1. Extract unique tags and technologies
  const { allTags, allTechnologies } = useMemo(() => {
    const tagsSet = new Set<string>();
    const techSet = new Set<string>();

    (projectData as Project[]).forEach((project) => {
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
  const filteredProjects = useMemo(() => {
    return (projectData as Project[]).filter((project) => {
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
  }, [filters, searchQuery, typedMapping]);

  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort(
      (a, b) => (b.stars ?? 0) - (a.stars ?? 0)
    );
  }, [filteredProjects]);

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
    });
    setSearchQuery("");
  };

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
                href='#all-projects'
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

      <section className='mt-10 mb-20 px-4 sm:px-6 lg:px-8' id='all-projects'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex justify-center items-center gap-4 mb-8'>
            <h2 className='text-2xl font-semibold tracking-wide text-mindfire-text-black'>
              Current Projects
            </h2>
            <ProjectCount totalProjects={sortedProjects.length} />
          </div>

          <div className='flex flex-col lg:flex-row gap-6'>
            <aside className='lg:w-72 flex-shrink-0 lg:sticky lg:top-4'>
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

            <main className='flex-1 min-w-0'>
              {sortedProjects.length === 0 ? (
                <div className='text-center py-12'>
                  <p className='text-lg text-gray-500'>No projects found.</p>
                </div>
              ) : (
                <div className='grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
                  {sortedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      title={project.title}
                      // Pass parentTitle manually to fix the component error
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
            </main>
          </div>
        </div>
      </section>
    </>
  );
}
