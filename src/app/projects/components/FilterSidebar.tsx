import React, { useState } from "react";
import { Filter, X } from "lucide-react";
import { FilterSidebarProps } from "@/types";
import FilterSidebarHeader from "./FilterSidebarHeader";
import SortByFilter from "./SortByFilter";
import ContributorsFilter from "./ContributorsFilter";
import StarsFilter from "./StarsFilter";
import ContributorsCountFilter from "./ContributorsCountFilter";
import TechnologyFilter from "./TechnologyFilter";
import TagsFilter from "./TagsFilter";

/* Sidebar component that manages all project filtering options */
const FilterSidebar: React.FC<FilterSidebarProps> = ({
  allTags,
  allTechnologies,
  contributors,
  filters,
  onFilterChange,
  onReset,
  searchQuery,
  onSearchChange,
  isMobileOpen,
  onMobileToggle,
}) => {
  /* Tracks which filter sections are expanded/collapsed */
  const [expandedSections, setExpandedSections] = useState({
    sortBy: true,
    tags: true,
    technology: true,
    stars: true,
    contributors: true,
    contributorList: true,
  });

  /* Toggle visibility of a filter section */
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  /* Calculate number of active filters to display indicator */
  const activeFiltersCount =
    filters.tags.length +
    filters.technologies.length +
    (filters.starRange !== "all" ? 1 : 0) +
    (filters.contributorRange !== "all" ? 1 : 0) +
    filters.selectedContributor.length;

  return (
    <>
      {/* Floating filter button for mobile view */}
      <button
        onClick={onMobileToggle}
        className='lg:hidden fixed bottom-6 right-6 z-40 bg-mf-red text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2'
      >
        <Filter className='w-5 h-5' />

        {/* Show number of active filters */}
        {activeFiltersCount > 0 && (
          <span className='bg-white text-mf-red text-xs font-bold px-2 py-0.5 rounded-full'>
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Background overlay when mobile sidebar is open */}
      {isMobileOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40'
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar container */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-80 lg:w-full
          transform transition-transform duration-300 ease-in-out
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
          bg-white rounded-lg shadow-sm border border-gray-200
          lg:max-h-[calc(100vh-2rem)]
          max-h-screen
          flex flex-col
        `}
      >
        {/* Close button for mobile sidebar */}
        <button
          onClick={onMobileToggle}
          className='lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10'
        >
          <X className='w-6 h-6' />
        </button>

        {/* Sidebar header containing search and reset controls */}
        <FilterSidebarHeader
          activeFiltersCount={activeFiltersCount}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onReset={onReset}
          onMobileToggle={onMobileToggle}
        />

        {/* Scrollable filter sections */}
        <div className='overflow-y-auto flex-1 p-5 pt-3'>
          {/* Sorting options */}
          <SortByFilter
            value={filters.sortBy}
            isExpanded={expandedSections.sortBy}
            onToggle={() => toggleSection("sortBy")}
            onChange={(v) => onFilterChange({ sortBy: v })}
          />

          {/* Contributor selection filter */}
          <ContributorsFilter
            contributors={contributors}
            selected={filters.selectedContributor}
            isExpanded={expandedSections.contributorList}
            onToggle={() => toggleSection("contributorList")}
            onSelect={(login) =>
              onFilterChange({
                selectedContributor: filters.selectedContributor.includes(login)
                  ? filters.selectedContributor.filter((c) => c !== login)
                  : [...filters.selectedContributor, login],
              })
            }
            onClearAll={() => onFilterChange({ selectedContributor: [] })}
          />

          {/* Star range filter */}
          <StarsFilter
            value={filters.starRange}
            isExpanded={expandedSections.stars}
            onToggle={() => toggleSection("stars")}
            onChange={(v) => onFilterChange({ starRange: v })}
          />

          {/* Contributor count range filter */}
          <ContributorsCountFilter
            value={filters.contributorRange}
            isExpanded={expandedSections.contributors}
            onToggle={() => toggleSection("contributors")}
            onChange={(v) => onFilterChange({ contributorRange: v })}
          />

          {/* Technology filter */}
          <TechnologyFilter
            technologies={allTechnologies}
            selected={filters.technologies}
            isExpanded={expandedSections.technology}
            onToggle={() => toggleSection("technology")}
            onChange={(tech) =>
              onFilterChange({
                technologies: filters.technologies.includes(tech)
                  ? filters.technologies.filter((t) => t !== tech)
                  : [...filters.technologies, tech],
              })
            }
          />

          {/* Tags filter */}
          <TagsFilter
            tags={allTags}
            selected={filters.tags}
            isExpanded={expandedSections.tags}
            onToggle={() => toggleSection("tags")}
            onChange={(tag) =>
              onFilterChange({
                tags: filters.tags.includes(tag)
                  ? filters.tags.filter((t) => t !== tag)
                  : [...filters.tags, tag],
              })
            }
          />
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
