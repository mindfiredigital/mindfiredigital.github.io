"use client";

import React, { useState, useRef } from "react";
import TopScorersPanel from "./components/TopScorersPanel";
import ContributorFilterSidebar from "./components/ContributorFilterSidebar";
import ContributorModal from "./components/ContributorModal";
import ContributorHero from "./components/Contributorhero";
import ContributorListSection from "./components/Contributorlistsection";
import contributorList from "@/asset/contributors.json";
import leaderboardData from "@/asset/leaderboard.json";
import { Contributor, TopScorer } from "@/types";
import { useContributorFilters } from "@/hooks/Usecontributorfilters";

export default function Contributors() {
  const contributorsArray = Object.values(contributorList) as Contributor[];
  const topScorers = leaderboardData.leaderboard as TopScorer[];

  const {
    filters,
    searchQuery,
    filteredAndSorted,
    handleFilterChange,
    handleSearchChange,
    handleReset,
  } = useContributorFilters(contributorsArray, topScorers);

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

  const filterSidebarProps = {
    filters,
    onFilterChange: (partial: Parameters<typeof handleFilterChange>[0]) => {
      handleFilterChange(partial);
      scrollToContributors();
    },
    onReset: handleReset,
    searchQuery,
    onSearchChange: (value: string) => {
      handleSearchChange(value);
      scrollToContributors();
    },
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
