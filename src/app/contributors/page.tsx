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
      <section className='bg-slate-50 min-h-screen'>
        {/*
          ═══════════════════════════════════════════════════════════════
          LAYOUT STRATEGY
          ───────────────────────────────────────────────────────────────
          The panel is fixed to the right edge of the viewport so it
          never steals width from the main content column.
          The main content uses the full 100vw and centres naturally.
          A right padding equal to the panel width is added to the
          carousel + scoring wrappers so text doesn't slide under panel.
          ═══════════════════════════════════════════════════════════════
        */}

        {/* ── Fixed Hall of Fame panel — desktop only ── */}
        <div className='hidden lg:block fixed top-[4.5rem] right-0 w-72 xl:w-80 h-[calc(100vh-4.5rem)] z-30 pr-4 xl:pr-6 pt-4'>
          <TopScorersPanel
            topScorers={topScorers}
            onViewDetails={setSelectedContributor}
          />
        </div>

        {/* ── Main content — full width, right-padded on desktop to clear panel ── */}
        <div className='lg:pr-[19rem] xl:pr-[22rem]'>
          {/* Page heading — truly full-width centred */}
          <div className='flex items-center justify-center gap-4 pt-10 px-4'>
            <h1 className='text-4xl leading-10 md:text-5xl md:!leading-[3.5rem] tracking-wide text-mindfire-text-black'>
              Our Contributors
            </h1>
            <ContributorCount totalContributors={contributorsArray.length} />
          </div>

          {/* Sub-heading */}
          <div className='mt-6 text-center px-4'>
            <h2 className='text-2xl font-medium text-gray-800 mb-3'>
              Our Top Contributors
            </h2>
            <p className='text-xl text-mf-light-grey tracking-wide'>
              Meet our top contributors — the people who help turn ideas into
              impact.
            </p>
          </div>

          {/* Carousel — centred in full remaining width */}
          <div className='mt-8 flex justify-center px-4'>
            <TopContributors
              contributors={contributorsArray}
              topScorers={topScorers}
            />
          </div>

          {/* Scoring system — directly below carousel */}
          <div className='mt-4 px-4 pb-2 max-w-3xl mx-auto'>
            <ScoringSystem />
          </div>

          {/* Mobile panel — shows below scoring on small screens */}
          <div className='lg:hidden px-4 mt-6 pb-4'>
            <TopScorersPanel
              topScorers={topScorers}
              onViewDetails={setSelectedContributor}
            />
          </div>

          {/* ── Leaderboard ── */}
          <div className='mt-8 pb-16 px-4'>
            <div className='flex items-center justify-center gap-4 mb-8'>
              <h2 className='text-3xl font-medium text-gray-800'>
                Leaderboard
              </h2>
              <span className='bg-white border border-gray-200 rounded-full px-4 py-1 text-sm font-semibold text-mindfire-text-red shadow-sm'>
                {filteredAndSorted.length} of {topScorers.length}
              </span>
            </div>

            <div className='flex gap-6'>
              <aside className='hidden lg:block w-64 flex-shrink-0 sticky top-4 self-start'>
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
