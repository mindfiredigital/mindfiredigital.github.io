"use client";

import React from "react";
import FilterSidebar from "./components/FilterSidebar";
import ProjectsHero from "./components/ProjectsHero";
import CurrentProjectsSection from "./components/CurrentProjectsSection";
import UpcomingProjectsSection from "./components/UpcomingProjectsSection";
import ProjectCount from "./components/ProjectCount";

import projectData from "@/asset/projects.json";
import upcomingProjectData from "@/asset/upcomingProjects.json";
import contributorsData from "@/asset/contributors.json";
import contributorMapping from "@/asset/contributor-mapping.json";
import leaderboardData from "@/asset/leaderboard.json";

import {
  Project,
  ContributorProject,
  TopScorer,
  ContributorMap,
} from "../../types";
import { useProjectFilters } from "@/hooks/useProjectFilters";
import { useHashScroll } from "@/hooks/useHashScroll";
import { PROJECTS_HEROZ } from "@/constants";

export default function ProjectsPage() {
  /* Extract top contributors from leaderboard data */
  const topScorers = leaderboardData.leaderboard as TopScorer[];

  /* Custom hook that manages project filtering, searching, sorting, and derived data */
  const {
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
  } = useProjectFilters(
    projectData as Project[],
    upcomingProjectData as Project[],
    contributorsData as unknown as ContributorProject[],
    contributorMapping as ContributorMap,
    topScorers
  );

  useHashScroll();

  return (
    <>
      <ProjectsHero />

      <section className='mt-10 mb-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Current Projects heading — sits above the sidebar+cards row */}
          <div id='current-projects' className='mb-8'>
            <div className='flex justify-center items-center gap-4'>
              <h2 className='text-2xl font-semibold tracking-wide text-mindfire-text-black'>
                {PROJECTS_HEROZ.currProject}
              </h2>
              <ProjectCount totalProjects={sortedCurrentProjects.length} />
            </div>
          </div>

          {/* Sidebar + cards row — sidebar sticks at this level, not at heading level */}
          <div className='flex flex-col lg:flex-row gap-6 items-start'>
            {/* Sticky sidebar — sticks to top of viewport when scrolling */}
            <aside className='lg:w-72 flex-shrink-0 lg:sticky lg:top-20 lg:self-start'>
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

            {/* Scrollable content — current + upcoming projects */}
            <div className='flex-1 min-w-0'>
              <CurrentProjectsSection projects={sortedCurrentProjects} />
              <UpcomingProjectsSection projects={sortedUpcomingProjects} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
