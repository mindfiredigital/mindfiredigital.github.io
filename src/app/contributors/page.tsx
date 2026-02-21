"use client";

import React, { useState, useMemo } from "react";
import ContributorCount from "./components/ContributorCount";
import TopContributors from "./components/TopContributors";
import TopScorersPanel from "./components/TopScorersPanel";
import ScoringSystem from "./components/ScoringSystem";
import ContributorFilterSidebar from "./components/ContributorFilterSidebar";
import ContributorCard from "./components/ContributorCard";
import ContributorModal from "./components/ContributorModal";
import contributorList from "../projects/assets/contributors.json";
import leaderboardData from "../projects/assets/leaderboard.json";
import { Contributor, ContributorFilters, TopScorer } from "@/types";

export default function Contributors() {
  const contributorsArray = Object.values(contributorList) as Contributor[];
  const topScorers = leaderboardData.leaderboard as TopScorer[];

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

  const getLastActiveDays = (username: string): number | null => {
    const match = contributorsArray.find(
      (c) => c.login.toLowerCase() === username.toLowerCase()
    );
    return match?.lastActiveDays ?? null;
  };

  const filteredAndSorted = useMemo(() => {
    let result = [...topScorers];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.username.toLowerCase().includes(q));
    }
    if (filters.activityFilter !== "all") {
      const maxDays = parseInt(filters.activityFilter, 10);
      result = result.filter((c) => {
        const days = getLastActiveDays(c.username);
        return days !== null && days <= maxDays;
      });
    }
    if (filters.scoreRange !== "all") {
      const min = parseInt(filters.scoreRange.replace("+", ""), 10);
      if (!isNaN(min)) result = result.filter((c) => c.total_score >= min);
    }
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
      <section className='bg-slate-50 min-h-screen overflow-x-hidden'>
        <div
          className='flex w-full overflow-hidden'
          style={{ height: "calc(100vh - 4.5rem)", maxWidth: "100vw" }}
        >
          <aside className='hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-gray-100 overflow-y-auto bg-slate-50 p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
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

          <main className='flex-1 min-w-0 overflow-y-auto overflow-x-hidden'>
            <div className='flex flex-col items-center text-center pt-10 px-6'>
              <div className='flex items-center justify-center gap-4'>
                <h1 className='text-4xl leading-10 md:text-5xl md:!leading-[3.5rem] tracking-wide text-mindfire-text-black'>
                  Our Contributors
                </h1>
                <ContributorCount totalContributors={topScorers.length} />
              </div>

              <div className='mt-6'>
                <h2 className='text-2xl font-medium text-gray-800 mb-3'>
                  Our Top Contributors
                </h2>
                <p className='text-xl text-mf-light-grey tracking-wide'>
                  Meet our top contributors — the people who help turn ideas
                  into impact.
                </p>
              </div>

              <div className='mt-8 w-full flex justify-center'>
                <TopContributors
                  contributors={contributorsArray}
                  topScorers={topScorers}
                />
              </div>

              <div className='mt-4 pb-2 w-full max-w-3xl'>
                <ScoringSystem />
              </div>
            </div>

            <div className='lg:hidden px-4 mt-6'>
              <TopScorersPanel
                topScorers={topScorers}
                onViewDetails={setSelectedContributor}
              />
            </div>

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

            <div className='mt-12 pb-16 px-6'>
              <div className='flex items-center justify-center gap-4 mb-8'>
                <h2 className='text-3xl font-medium text-gray-800'>
                  Contributors
                </h2>
                <span className='bg-white border border-gray-200 rounded-full px-4 py-1 text-sm font-semibold text-mindfire-text-red shadow-sm'>
                  {filteredAndSorted.length} of {topScorers.length}
                </span>
              </div>

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
            </div>
          </main>

          <div className='hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 border-l border-gray-100 overflow-y-auto bg-slate-50 p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
            <TopScorersPanel
              topScorers={topScorers}
              onViewDetails={setSelectedContributor}
            />
          </div>
        </div>
      </section>

      {selectedContributor && (
        <ContributorModal
          contributor={selectedContributor}
          onClose={() => setSelectedContributor(null)}
        />
      )}
    </>
  );
}
