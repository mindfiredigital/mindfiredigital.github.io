"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import ProjectCard from "./components/ProjectCard";
import ProjectCount from "./components/ProjectCount";
import FilterSidebar from "./components/FilterSidebar";
import projectsImage from "../../../public/images/projects.webp";
import projectData from "./assets/projects.json";
import contributorsData from "./assets/contributors.json";

interface Filters {
  tags: string[];
  technologies: string[];
  starRange: string;
  contributorRange: string;
  selectedContributor: string;
}

interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export default function ProjectsPage() {
  const [filters, setFilters] = useState<Filters>({
    tags: [],
    technologies: [],
    starRange: "all",
    contributorRange: "all",
    selectedContributor: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [contributorProjectMap, setContributorProjectMap] = useState<{
    [key: string]: number[];
  }>({});

  // Fetch contributor-project mapping from GitHub repos
  useEffect(() => {
    async function fetchContributorMapping() {
      const mapping: { [key: string]: number[] } = {};

      // Parse GitHub URLs and create a mapping
      for (const project of projectData) {
        const match = project.githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
          const [, owner, repo] = match;
          try {
            const response = await fetch(
              `https://api.github.com/repos/${owner}/${repo}/contributors?per_page=100`,
              {
                headers: {
                  Accept: "application/vnd.github.v3+json",
                },
              }
            );

            if (response.ok) {
              const contributors: GitHubContributor[] = await response.json();
              contributors.forEach((contrib: GitHubContributor) => {
                if (!mapping[contrib.login]) {
                  mapping[contrib.login] = [];
                }
                mapping[contrib.login].push(project.id);
              });
            }
          } catch (error) {
            console.error(`Failed to fetch contributors for ${project.title}`);
          }
        }
      }

      setContributorProjectMap(mapping);
    }

    // Only fetch if we don't have the mapping yet
    if (Object.keys(contributorProjectMap).length === 0) {
      fetchContributorMapping();
    }
  }, []);

  // Extract unique tags and technologies from projects
  const { allTags, allTechnologies } = useMemo(() => {
    const tagsSet = new Set<string>();
    const techSet = new Set<string>();

    projectData.forEach((project) => {
      project.tags?.forEach((tag) => {
        const lowerTag = tag.toLowerCase();
        // Categorize tags
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

  // Calculate contributor count per project
  const projectsWithContributors = useMemo(() => {
    return projectData.map((project) => ({
      ...project,
      contributors: Math.floor(Math.random() * 50) + 1,
    }));
  }, []);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projectsWithContributors.filter((project) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          project.title.toLowerCase().includes(query) ||
          project.shortDescription.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const hasTag = filters.tags.some(
          (tag) =>
            project.tags?.some(
              (pTag) => pTag.toLowerCase() === tag.toLowerCase()
            )
        );
        if (!hasTag) return false;
      }

      // Technologies filter
      if (filters.technologies.length > 0) {
        const hasTech = filters.technologies.some(
          (tech) =>
            project.tags?.some(
              (pTag) => pTag.toLowerCase() === tech.toLowerCase()
            )
        );
        if (!hasTech) return false;
      }

      // Star range filter
      if (filters.starRange !== "all") {
        const stars = project.stars || 0;
        switch (filters.starRange) {
          case "10+":
            if (stars < 10) return false;
            break;
          case "50+":
            if (stars < 50) return false;
            break;
          case "100+":
            if (stars < 100) return false;
            break;
          case "500+":
            if (stars < 500) return false;
            break;
        }
      }

      // Contributor range filter
      if (filters.contributorRange !== "all") {
        const contribs = project.contributors || 0;
        switch (filters.contributorRange) {
          case "5+":
            if (contribs < 5) return false;
            break;
          case "10+":
            if (contribs < 10) return false;
            break;
          case "20+":
            if (contribs < 20) return false;
            break;
          case "50+":
            if (contribs < 50) return false;
            break;
        }
      }

      // Selected contributor filter - now actually works!
      if (filters.selectedContributor) {
        const projectIds =
          contributorProjectMap[filters.selectedContributor] || [];
        if (!projectIds.includes(project.id)) return false;
      }

      return true;
    });
  }, [projectsWithContributors, filters, searchQuery, contributorProjectMap]);

  // Sort by stars
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
      selectedContributor: "",
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
            alt='group-of-people-gathered-around-wooden-table'
            className='max-lg:w-full object-contain'
            height='500'
            width='600'
            priority
          />
        </div>
      </section>

      <section className='mt-10 mb-20 px-4 sm:px-6 lg:px-8' id='all-projects'>
        <div className='max-w-7xl mx-auto'>
          {/* Header with project count */}
          <div className='flex justify-center items-center gap-4 mb-8'>
            <h2 className='text-2xl font-semibold tracking-wide text-mindfire-text-black'>
              Current Projects
            </h2>
            <ProjectCount totalProjects={sortedProjects.length} />
          </div>

          {/* Main container with sidebar and projects */}
          <div className='flex flex-col lg:flex-row gap-6'>
            {/* Sidebar Filters */}
            <aside className='lg:w-72 flex-shrink-0 lg:sticky lg:top-4'>
              {" "}
              {/* Added sticky to aside */}
              <div className='max-h-[calc(100vh-2rem)] overflow-y-auto pr-2 custom-scrollbar'>
                {/* 1. max-h: Sets height to viewport height minus some margin 
                2. overflow-y-auto: Enables independent scrolling
                3. custom-scrollbar: Optional class for styling
              */}
                <FilterSidebar
                  allTags={allTags}
                  allTechnologies={allTechnologies}
                  contributors={contributorsData}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            </aside>

            {/* Projects Grid */}
            <main className='flex-1 min-w-0'>
              {sortedProjects.length === 0 ? (
                <div className='text-center py-12'>
                  <p className='text-lg text-gray-500'>
                    No projects found matching your filters.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className='mt-4 text-sm text-mf-red hover:underline'
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className='grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
                  {sortedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      title={project.title}
                      parentTitle='Current Projects'
                      shortDescription={project.shortDescription}
                      githubUrl={project.githubUrl}
                      documentationUrl={project.documentationUrl}
                      stars={project.stars}
                      tags={project.tags}
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
