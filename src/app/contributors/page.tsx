"use client";

import React, { useState, useMemo, useRef } from "react";
import TopScorersPanel from "./components/TopScorersPanel";
import ContributorFilterSidebar from "./components/ContributorFilterSidebar";
import ContributorModal from "./components/ContributorModal";
import ContributorHero from "./components/Contributorhero";
import ContributorListSection from "./components/Contributorlistsection";
import contributorList from "@/asset/contributors.json";
import leaderboardData from "@/asset/leaderboard.json";
import { Contributor, ContributorFilters, TopScorer } from "@/types";
import { CONTRIBUTORS_FILTERS_DEFAULT } from "@/constants";

export default function Contributors() {
  const contributorsArray = Object.values(contributorList) as Contributor[];
  const topScorers = leaderboardData.leaderboard as TopScorer[];

  const [filters, setFilters] = useState<ContributorFilters>(
    CONTRIBUTORS_FILTERS_DEFAULT
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedContributor, setSelectedContributor] =
    useState<TopScorer | null>(null);

  const contributorsSectionRef = useRef<HTMLDivElement>(null);
  const mainPanelRef = useRef<HTMLDivElement>(null);

  const scrollToContributors = () => {
    if (contributorsSectionRef.current && mainPanelRef.current) {
      const sectionTop = contributorsSectionRef.current.offsetTop;
      mainPanelRef.current.scrollTo({ top: sectionTop, behavior: "smooth" });
    }
  };

  const handleFilterChange = (partial: Partial<ContributorFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    scrollToContributors();
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    scrollToContributors();
  };

  const handleReset = () => {
    setFilters({ ...CONTRIBUTORS_FILTERS_DEFAULT });
    setSearchQuery("");
  };

  const getLastActiveDays = (username: string): number | null => {
    const match = contributorsArray.find(
      (c) => c.login.toLowerCase() === username.toLowerCase()
    );
    return match?.lastActiveDays ?? null;
  };

  /*
   * filteredAndSorted — derived from topScorers on every filter/search change.
   * Applies search → activity filter → score range → sort in that order.
   */
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

  const filterSidebarProps = {
    filters,
    onFilterChange: handleFilterChange,
    onReset: handleReset,
    searchQuery,
    onSearchChange: handleSearchChange,
    isMobileOpen: isMobileFilterOpen,
    onMobileToggle: () => setIsMobileFilterOpen((v) => !v),
  };

  return (
    <>
      <section className='bg-slate-50 min-h-screen overflow-x-hidden'>
        <div
          className='flex w-full overflow-hidden'
          style={{ height: "calc(100vh - 4.5rem)", maxWidth: "100vw" }}
        >
          {/* Desktop left sidebar — filter panel */}
          <aside className='hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-gray-100 overflow-y-auto bg-slate-50 p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
            <ContributorFilterSidebar {...filterSidebarProps} />
          </aside>

          <main
            ref={mainPanelRef}
            className='flex-1 min-w-0 overflow-y-auto overflow-x-hidden'
          >
            <ContributorHero
              contributorsArray={contributorsArray}
              topScorers={topScorers}
            />

            {/* Mobile-only: top scorers panel + filter sidebar */}
            <div className='lg:hidden px-4 mt-6'>
              <TopScorersPanel
                topScorers={topScorers}
                onViewDetails={setSelectedContributor}
              />
            </div>
            <div className='lg:hidden'>
              <ContributorFilterSidebar {...filterSidebarProps} />
            </div>

            <ContributorListSection
              filteredAndSorted={filteredAndSorted}
              totalCount={topScorers.length}
              onViewDetails={setSelectedContributor}
              onReset={handleReset}
              sectionRef={contributorsSectionRef}
            />
          </main>

          {/* Desktop right sidebar — top scorers hall of fame */}
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
