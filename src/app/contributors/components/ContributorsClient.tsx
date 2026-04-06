/*
  ContributorsClient — "use client" interactive shell
  - Receives pre-parsed contributorsArray and topScorers as props
    from the Server Component (page.tsx); no JSON imports needed here.
  - Owns all interactive state via useContributorPage:
    filtering, sorting, selected contributor, scroll refs.
  - ContributorModal is lazy-loaded (dynamic import) so its bundle
    is only fetched when a contributor card is actually clicked.
*/
"use client";

/*
  Component imports
  - UI panels and sections used to build the Contributors page layout
*/
import TopScorersPanel from "./TopScorersPanel";
import ContributorFilterSidebar from "./ContributorFilterSidebar";
import ContributorHero from "./ContributorHero";
import ContributorListSection from "./ContributorListSection";

import { ContributorsClientProps } from "@/types";

/*
  Hook and utility imports
  - useContributorPage: encapsulates all filter / sort / selection state
  - buildFilterSidebarProps: derives sidebar prop object from page state
*/
import { useContributorPage } from "@/hooks";
import { buildFilterSidebarProps } from "@/app/utils";
import dynamic from "next/dynamic";

/*
  Lazy-load ContributorModal
  - Deferred until the user clicks "View Profile" on a contributor card
  - Skeleton placeholder shown while the chunk is loading
*/
const ContributorModal = dynamic(() => import("./ContributorModal"), {
  loading: () => <div className='skeleton h-64 w-full' />,
});

export default function ContributorsClient({
  contributorsArray,
  topScorers,
}: ContributorsClientProps) {
  /*
    useContributorPage manages:
    - filteredAndSorted: result of applying all active filters + sort
    - handleReset: clears all filters back to defaults
    - selectedContributor: contributor whose modal is open (null = closed)
    - setSelectedContributor: opens / closes the detail modal
    - contributorsSectionRef: ref forwarded to the list section for scroll
    - mainPanelRef: ref for the scrollable main panel
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

      {/* Contributor Details Modal
          - Conditionally rendered; only mounts when a contributor is selected */}
      {selectedContributor && (
        <ContributorModal
          contributor={selectedContributor}
          onClose={() => setSelectedContributor(null)}
        />
      )}
    </>
  );
}
