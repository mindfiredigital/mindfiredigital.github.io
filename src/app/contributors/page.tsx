"use client";

/*
  Component imports
  - UI panels and sections used in the Contributors page
*/
import TopScorersPanel from "./components/TopScorersPanel";
import ContributorFilterSidebar from "./components/ContributorFilterSidebar";
import ContributorModal from "./components/ContributorModal";
import ContributorHero from "./components/Contributorhero";
import ContributorListSection from "./components/Contributorlistsection";

/*
  Data imports
  - Static JSON data for contributors and leaderboard
*/
import contributorList from "@/asset/contributors.json";
import leaderboardData from "@/asset/leaderboard.json";

/*
  Types & hooks
  - Type definitions and custom hook for managing state
*/
import { Contributor, TopScorer } from "@/types";
import { useContributorPage } from "@/hooks";
import { buildFilterSidebarProps } from "@/app/utils";

/*
  Contributors Page
  - Displays contributors leaderboard and filters
  - Handles contributor selection and modal view
  - Responsive layout with sidebar and panels
*/
export default function Contributors() {
  /* Convert contributors object into array */
  const contributorsArray = Object.values(contributorList) as Contributor[];

  /* Extract leaderboard data */
  const topScorers = leaderboardData.leaderboard as TopScorer[];

  /*
    Custom hook to manage page state
    - filtering
    - sorting
    - selected contributor
    - refs for scrolling/layout
  */
  const pageState = useContributorPage(contributorsArray, topScorers);

  /* Destructure required state and handlers */
  const {
    filteredAndSorted,
    handleReset,
    selectedContributor,
    setSelectedContributor,
    contributorsSectionRef,
    mainPanelRef,
  } = pageState;

  /* Build props for filter sidebar from page state */
  const filterSidebarProps = buildFilterSidebarProps(pageState);

  return (
    <>
      {/* Main container
          - Full page layout
          - Prevents horizontal overflow */}
      <section className='bg-slate-50 min-h-screen overflow-x-hidden'>
        <div
          className='flex w-full overflow-hidden'
          style={{ height: "calc(100vh - 4.5rem)", maxWidth: "100vw" }}
        >
          {/* Left Sidebar (Desktop only)
              - Contains filter controls
              - Hidden on smaller screens */}
          <aside className='hidden lg:flex flex-col w-64 flex-shrink-0 border-r border-gray-100 overflow-y-auto bg-slate-50 p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
            <ContributorFilterSidebar {...filterSidebarProps} />
          </aside>

          {/* Main Content Area */}
          <main
            ref={mainPanelRef}
            className='flex-1 min-w-0 overflow-y-auto overflow-x-hidden'
          >
            {/* Hero Section */}
            <ContributorHero
              contributorsArray={contributorsArray}
              topScorers={topScorers}
            />

            {/* Top Scorers (Mobile View) */}
            <div className='lg:hidden px-4 mt-6'>
              <TopScorersPanel
                topScorers={topScorers}
                onViewDetails={setSelectedContributor}
              />
            </div>

            {/* Filters (Mobile View) */}
            <div className='lg:hidden'>
              <ContributorFilterSidebar {...filterSidebarProps} />
            </div>

            {/* Contributors List Section */}
            <ContributorListSection
              filteredAndSorted={filteredAndSorted}
              totalCount={topScorers.length}
              onViewDetails={setSelectedContributor}
              onReset={handleReset}
              sectionRef={contributorsSectionRef}
            />
          </main>

          {/* Right Sidebar (Desktop Top Scorers) */}
          <div className='hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 border-l border-gray-100 overflow-y-auto bg-slate-50 p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
            <TopScorersPanel
              topScorers={topScorers}
              onViewDetails={setSelectedContributor}
            />
          </div>
        </div>
      </section>

      {/* Contributor Details Modal */}
      {selectedContributor && (
        <ContributorModal
          contributor={selectedContributor}
          onClose={() => setSelectedContributor(null)}
        />
      )}
    </>
  );
}
