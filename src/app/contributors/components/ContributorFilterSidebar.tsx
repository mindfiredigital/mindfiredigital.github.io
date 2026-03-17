"use client";

import React, { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { ContributorFilterSidebarProps } from "@/types";
import { FilterSection } from "./FilterSection";
import { RadioGroup } from "./RadioGroup";
import { FILTER_LABELS } from "@/constants";

const ContributorFilterSidebar: React.FC<ContributorFilterSidebarProps> = ({
  filters,
  onFilterChange,
  onReset,
  searchQuery,
  onSearchChange,
  isMobileOpen,
  onMobileToggle,
}) => {
  /* State to manage expanded/collapsed filter sections */
  const [expandedSections, setExpandedSections] = useState({
    sortBy: true,
    activity: true,
    scoreRange: true,
  });

  /* Toggle visibility of a filter section */
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  /* Count active filters (excluding default values) */
  const activeFiltersCount =
    (filters.activityFilter !== "all" ? 1 : 0) +
    (filters.scoreRange !== "all" ? 1 : 0);

  return (
    <>
      {/* Mobile floating filter button */}
      <button
        onClick={onMobileToggle}
        className='lg:hidden fixed bottom-6 right-6 z-40 bg-mf-red text-white px-5 py-3 rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2'
      >
        <SlidersHorizontal className='w-4 h-4' />
        <span className='text-sm font-semibold'>Filters</span>
        {activeFiltersCount > 0 && (
          <span className='bg-white text-mf-red text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center'>
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Mobile overlay backdrop */}
      {isMobileOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40'
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar container */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-72 lg:w-full
          transform transition-transform duration-300 ease-in-out
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          bg-white rounded-xl shadow-sm border border-gray-100
          lg:max-h-[calc(100vh-2rem)]
          max-h-screen
          flex flex-col
        `}
      >
        {/* Close button (mobile) */}
        <button
          onClick={onMobileToggle}
          className='lg:hidden absolute top-4 right-4 text-gray-400 hover:text-gray-700 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors'
        >
          <X className='w-5 h-5' />
        </button>

        {/* Header section with title and reset */}
        <div className='p-5 pb-4 border-b border-gray-100'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-2'>
              <SlidersHorizontal className='w-4 h-4 text-gray-600' />
              <h3 className='text-sm font-bold text-gray-900 uppercase tracking-wider'>
                {FILTER_LABELS.heading}
              </h3>
            </div>

            {/* Reset filters button */}
            {activeFiltersCount > 0 && (
              <button
                onClick={onReset}
                className='text-xs text-mf-red hover:text-red-700 flex items-center gap-1 font-semibold bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-full transition-colors'
              >
                <X className='w-3 h-3' />
                Reset ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Search input */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5' />
            <input
              type='text'
              placeholder={FILTER_LABELS.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className='w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mf-red/30 focus:border-mf-red transition-all bg-gray-50 placeholder:text-gray-400'
            />

            {/* Clear search button */}
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className='absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                <X className='w-3.5 h-3.5' />
              </button>
            )}
          </div>
        </div>

        {/* Filter sections */}
        <div className='overflow-y-auto flex-1 p-4 space-y-1'>
          {/* Sort By filter */}
          <FilterSection
            title='Sort By'
            expanded={expandedSections.sortBy}
            onToggle={() => toggleSection("sortBy")}
          >
            <RadioGroup
              name='sortBy'
              value={filters.sortBy}
              onChange={(val) => onFilterChange({ sortBy: val })}
              options={[
                { id: "total_score", label: "Total Score" },
                { id: "code_score", label: "Code Score" },
                { id: "quality_score", label: "Quality Score" },
                { id: "community_score", label: "Community Score" },
                { id: "totalCommits", label: "Most Commits" },
                { id: "totalPRs", label: "Most Pull Requests" },
                { id: "totalPRReviewsGiven", label: "Most PR Reviews" },
                { id: "totalIssuesOpened", label: "Most Issues Opened" },
              ]}
            />
          </FilterSection>

          {/* Activity filter */}
          <FilterSection
            title='Last Active'
            expanded={expandedSections.activity}
            onToggle={() => toggleSection("activity")}
          >
            <RadioGroup
              name='activityFilter'
              value={filters.activityFilter}
              onChange={(val) => onFilterChange({ activityFilter: val })}
              options={[
                { id: "all", label: "Any time" },
                { id: "7", label: "Last 7 days" },
                { id: "30", label: "Last 30 days" },
                { id: "90", label: "Last 90 days" },
              ]}
              activeColor={filters.activityFilter !== "all"}
            />
          </FilterSection>

          {/* Score range filter */}
          <FilterSection
            title='Min Total Score'
            expanded={expandedSections.scoreRange}
            onToggle={() => toggleSection("scoreRange")}
          >
            <RadioGroup
              name='scoreRange'
              value={filters.scoreRange}
              onChange={(val) => onFilterChange({ scoreRange: val })}
              options={[
                { id: "all", label: "Any score" },
                { id: "100", label: "100+ pts" },
                { id: "500", label: "500+ pts" },
                { id: "1000", label: "1,000+ pts" },
                { id: "2000", label: "2,000+ pts" },
              ]}
              activeColor={filters.scoreRange !== "all"}
            />
          </FilterSection>
        </div>
      </div>
    </>
  );
};

export default ContributorFilterSidebar;
