"use client";

import React, { useState, useMemo } from "react";
import ContributorCount from "./components/ContributorCount";
import TopContributors from "./components/TopContributors";
import ContributorFilterSidebar from "./components/ContributorFilterSidebar";
import ContributorCard from "./components/ContributorCard";
import ContributorModal from "./components/ContributorModal";
import contributorList from "../projects/assets/contributors.json";
import leaderboardData from "../projects/assets/leaderboard.json";
import { Contributor, ContributorFilters, TopScorer } from "@/types";

export default function Contributors() {
  const contributorsArray = Object.values(contributorList) as Contributor[];

  // Top active contributors for the hero section (unchanged)
  const activeTopContributors = [...contributorsArray]
    .filter((c) => c.lastActiveDays !== null && c.lastActiveDays <= 30)
    .sort((a, b) => b.contributions - a.contributions);

  // Leaderboard data — use ALL scorers, no slice
  const topScorers = leaderboardData.leaderboard as TopScorer[];

  // Filter / sort state
  const [filters, setFilters] = useState<ContributorFilters>({
    sortBy: "total_score",
    activityFilter: "all",
    scoreRange: "all",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] =
    useState<TopScorer | null>(null);

  const handleFilterChange = (partial: Partial<ContributorFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleReset = () => {
    setFilters({
      sortBy: "total_score",
      activityFilter: "all",
      scoreRange: "all",
    });
    setSearchQuery("");
  };

  // Find matching contributor from contributors.json by username to get lastActiveDays
  const getLastActiveDays = (username: string): number | null => {
    const match = contributorsArray.find(
      (c) => c.login.toLowerCase() === username.toLowerCase()
    );
    return match?.lastActiveDays ?? null;
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...topScorers];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.username.toLowerCase().includes(q));
    }

    // Activity filter
    if (filters.activityFilter !== "all") {
      const maxDays = parseInt(filters.activityFilter, 10);
      result = result.filter((c) => {
        const days = getLastActiveDays(c.username);
        return days !== null && days <= maxDays;
      });
    }

    // Score range filter
    // scoreRange is now stored as a plain number string e.g. "100", "500", "1000"
    if (filters.scoreRange !== "all") {
      // Strip any trailing "+" in case old values still appear
      const min = parseInt(filters.scoreRange.replace("+", ""), 10);
      if (!isNaN(min)) {
        result = result.filter((c) => c.total_score >= min);
      }
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "code_score":
          return b.code_score - a.code_score;
        case "quality_score":
          return b.quality_score - a.quality_score;
        case "community_score":
          return b.community_score - a.community_score;
        case "totalCommits":
          return b.totalCommits - a.totalCommits;
        case "totalPRs":
          return b.totalPRs - a.totalPRs;
        case "totalPRReviewsGiven":
          return b.totalPRReviewsGiven - a.totalPRReviewsGiven;
        case "totalIssuesOpened":
          return b.totalIssuesOpened - a.totalIssuesOpened;
        case "total_score":
        default:
          return b.total_score - a.total_score;
      }
    });

    return result;
  }, [topScorers, filters, searchQuery]);

  return (
    <>
      <section className='bg-slate-50'>
        <div className='container mx-auto text-center'>
          {/* Header */}
          <div className='flex items-center justify-center gap-4 mt-10'>
            <h1 className='text-4xl leading-10 md:text-5xl md:!leading-[3.5rem] tracking-wide text-mindfire-text-black'>
              Our Contributors
            </h1>
            <ContributorCount totalContributors={contributorsArray.length} />
          </div>

          {/* Top Contributors strip */}
          <div className='mt-12 flex flex-col items-center justify-center'>
            <h2 className='text-2xl font-medium text-gray-800 mb-6'>
              Top Active Contributors
            </h2>
            <p className='text-xl text-mf-light-grey tracking-wide mb-2 flex flex-wrap'>
              Meet our top contributors — the people who help turn ideas into
              impact.
            </p>
            <TopContributors contributors={activeTopContributors} />
          </div>
        </div>

        {/* Leaderboard section */}
        <div className='container mx-auto mt-10 pb-16'>
          <div className='flex items-center justify-center gap-4 mb-8'>
            <h2 className='text-3xl font-medium text-gray-800'>Leaderboard</h2>
            <span className='bg-white border border-gray-200 rounded-full px-4 py-1 text-sm font-semibold text-mindfire-text-red shadow-sm'>
              {filteredAndSorted.length} of {topScorers.length}
            </span>
          </div>

          <div className='flex gap-6 px-4'>
            {/* Desktop Sidebar */}
            <aside className='hidden lg:block w-64 flex-shrink-0'>
              <ContributorFilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isMobileOpen={isMobileFilterOpen}
                onMobileToggle={() => setIsMobileFilterOpen((v) => !v)}
              />
            </aside>

            {/* Mobile sidebar (overlay) */}
            <div className='lg:hidden'>
              <ContributorFilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                isMobileOpen={isMobileFilterOpen}
                onMobileToggle={() => setIsMobileFilterOpen((v) => !v)}
              />
            </div>

            {/* Grid */}
            <main className='flex-1 min-w-0'>
              {filteredAndSorted.length > 0 ? (
                <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                  {filteredAndSorted.map((contributor, index) => (
                    <ContributorCard
                      key={contributor.id}
                      contributor={contributor}
                      displayRank={index + 1}
                      onViewDetails={setSelectedContributor}
                    />
                  ))}
                </div>
              ) : (
                <div className='flex flex-col justify-center items-center h-64 gap-3'>
                  <p className='text-xl text-mf-light-grey tracking-wide'>
                    No contributors found.
                  </p>
                  <button
                    onClick={handleReset}
                    className='text-sm text-mf-red hover:underline font-medium'
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedContributor && (
        <ContributorModal
          contributor={selectedContributor}
          onClose={() => setSelectedContributor(null)}
        />
      )}
    </>
  );
}
