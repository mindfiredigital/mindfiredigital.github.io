import React, { useState } from "react";
import { Search, ChevronDown, ChevronUp, X, Filter } from "lucide-react";
import { FilterSidebarProps } from "../../../types";

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
  const [expandedSections, setExpandedSections] = useState({
    sortBy: true,
    tags: true,
    technology: true,
    stars: true,
    contributors: true,
    contributorList: true,
  });

  const [contributorSearch, setContributorSearch] = useState("");

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    onFilterChange({ tags: newTags });
  };

  const handleTechnologyToggle = (tech: string) => {
    const newTechs = filters.technologies.includes(tech)
      ? filters.technologies.filter((t) => t !== tech)
      : [...filters.technologies, tech];
    onFilterChange({ technologies: newTechs });
  };

  const handleStarRangeChange = (range: string) => {
    onFilterChange({ starRange: range });
  };

  const handleContributorRangeChange = (range: string) => {
    onFilterChange({ contributorRange: range });
  };

  const handleContributorSelect = (login: string) => {
    const newSelectedContributors = filters.selectedContributor.includes(login)
      ? filters.selectedContributor.filter((c) => c !== login)
      : [...filters.selectedContributor, login];
    onFilterChange({ selectedContributor: newSelectedContributors });
  };

  const handleSortByChange = (sortBy: string) => {
    onFilterChange({ sortBy });
  };

  // NEW: Function to clear all selected contributors
  const handleClearAllContributors = () => {
    onFilterChange({ selectedContributor: [] });
  };

  const filteredContributors = contributors.filter((contributor) =>
    contributor.login.toLowerCase().includes(contributorSearch.toLowerCase())
  );

  const activeFiltersCount =
    filters.tags.length +
    filters.technologies.length +
    (filters.starRange !== "all" ? 1 : 0) +
    (filters.contributorRange !== "all" ? 1 : 0) +
    filters.selectedContributor.length;

  return (
    <>
      {/* Mobile Filter Button */}
      <button
        onClick={onMobileToggle}
        className='lg:hidden fixed bottom-6 right-6 z-40 bg-mf-red text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2'
      >
        <Filter className='w-5 h-5' />
        {activeFiltersCount > 0 && (
          <span className='bg-white text-mf-red text-xs font-bold px-2 py-0.5 rounded-full'>
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40'
          onClick={onMobileToggle}
        />
      )}

      {/* Filter Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        w-80 lg:w-full
        transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        bg-white rounded-lg shadow-sm border border-gray-200
        lg:max-h-[calc(100vh-2rem)]
        max-h-screen
        flex flex-col
      `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onMobileToggle}
          className='lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10'
        >
          <X className='w-6 h-6' />
        </button>

        {/* Sticky Header Section */}
        <div className='sticky top-0 bg-white z-10 p-5 pb-0 border-b border-gray-200'>
          <div className='flex items-center justify-between mb-5'>
            <h3 className='text-xl font-semibold text-gray-900'>Filters</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={onReset}
                className='text-xs text-mf-red hover:text-red-700 flex items-center gap-1 font-medium'
              >
                <X className='w-3.5 h-3.5' />
                Clear ({activeFiltersCount})
              </button>
            )}
          </div>

          {/* Search Box */}
          <div className='mb-5'>
            <div className='relative'>
              <Search className='absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='Search projects...'
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className='w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mf-red focus:border-transparent'
              />
            </div>
          </div>
        </div>

        {/* Scrollable Filter Content */}
        <div className='overflow-y-auto flex-1 p-5 pt-3'>
          {/* Sort By Filter - NEW - Placed at the top */}
          <div className='mb-5 border-b border-gray-200 pb-4'>
            <button
              onClick={() => toggleSection("sortBy")}
              className='flex items-center justify-between w-full text-left py-1'
            >
              <h4 className='text-sm font-semibold text-gray-900'>Sort By</h4>
              {expandedSections.sortBy ? (
                <ChevronUp className='w-4 h-4 text-gray-500' />
              ) : (
                <ChevronDown className='w-4 h-4 text-gray-500' />
              )}
            </button>
            {expandedSections.sortBy && (
              <div className='mt-3 space-y-2'>
                {[
                  { id: "activity", label: "Most Active (Recent Commits)" },
                  { id: "stars", label: "Stars (Highest to Lowest)" },
                  { id: "newest", label: "Recently Created" },
                  { id: "oldest", label: "Oldest Projects" },
                  { id: "name", label: "Name (A to Z)" },
                ].map((option) => (
                  <label
                    key={option.id}
                    className='flex items-center cursor-pointer group'
                  >
                    <input
                      type='radio'
                      name='sortBy'
                      value={option.id}
                      checked={filters.sortBy === option.id}
                      onChange={() => handleSortByChange(option.id)}
                      className='w-3.5 h-3.5 text-mf-red border-gray-300 focus:ring-mf-red'
                    />
                    <span className='ml-2 text-xs text-gray-700 group-hover:text-gray-900'>
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Contributors List */}
          <div className='mb-5 border-b border-gray-200 pb-4'>
            <button
              onClick={() => toggleSection("contributorList")}
              className='flex items-center justify-between w-full text-left py-1'
            >
              <h4 className='text-sm font-semibold text-gray-900'>
                Contributors{" "}
                {filters.selectedContributor.length > 0 &&
                  `(${filters.selectedContributor.length})`}
              </h4>
              {expandedSections.contributorList ? (
                <ChevronUp className='w-4 h-4 text-gray-500' />
              ) : (
                <ChevronDown className='w-4 h-4 text-gray-500' />
              )}
            </button>
            {expandedSections.contributorList && (
              <div className='mt-3'>
                {/* Contributor Search */}
                <div className='relative mb-3'>
                  <Search className='absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-3.5 h-3.5' />
                  <input
                    type='text'
                    placeholder='Search contributors...'
                    value={contributorSearch}
                    onChange={(e) => setContributorSearch(e.target.value)}
                    className='w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-mf-red focus:border-transparent'
                  />
                </div>

                {/* Selected Contributors Display */}
                {filters.selectedContributor.length > 0 && (
                  <div className='mb-3 p-2 bg-red-50 rounded-md border border-red-200'>
                    <div className='flex items-center justify-between mb-1.5'>
                      <p className='text-[10px] text-gray-600 font-medium'>
                        Selected:
                      </p>
                      {/* NEW: Clear All Button */}
                      <button
                        onClick={handleClearAllContributors}
                        className='text-[10px] text-mf-red hover:text-red-800 font-medium flex items-center gap-0.5'
                        title='Clear all selected contributors'
                      >
                        <X className='w-3 h-3' />
                        Clear All
                      </button>
                    </div>
                    <div className='flex flex-wrap gap-1.5'>
                      {filters.selectedContributor.map((login) => {
                        const contributor = contributors.find(
                          (c) => c.login === login
                        );
                        return contributor ? (
                          <div
                            key={login}
                            className='flex items-center gap-1 bg-white px-2 py-1 rounded-md text-[10px] border border-red-300'
                          >
                            <img
                              src={contributor.avatar_url}
                              alt={login}
                              className='w-4 h-4 rounded-full'
                            />
                            <span className='text-gray-900 font-medium'>
                              {login}
                            </span>
                            <button
                              onClick={() => handleContributorSelect(login)}
                              className='ml-1 text-red-600 hover:text-red-800'
                            >
                              <X className='w-3 h-3' />
                            </button>
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Contributor List */}
                <div className='max-h-72 overflow-y-auto space-y-1.5'>
                  {filteredContributors.slice(0, 50).map((contributor) => (
                    <label
                      key={contributor.id}
                      className='w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer border border-transparent'
                    >
                      <input
                        type='checkbox'
                        checked={filters.selectedContributor.includes(
                          contributor.login
                        )}
                        onChange={() =>
                          handleContributorSelect(contributor.login)
                        }
                        className='w-3.5 h-3.5 text-mf-red border-gray-300 rounded focus:ring-mf-red flex-shrink-0'
                      />
                      <img
                        src={contributor.avatar_url}
                        alt={contributor.login}
                        className='w-8 h-8 rounded-full flex-shrink-0'
                      />
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-medium text-gray-900 truncate'>
                          {contributor.login}
                        </p>
                        <p className='text-[10px] text-gray-500'>
                          Score: {contributor.total_score}
                        </p>
                      </div>
                    </label>
                  ))}
                  {filteredContributors.length > 50 && (
                    <p className='text-[10px] text-gray-500 text-center py-2'>
                      Showing first 50 contributors
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stars Filter */}
          <div className='mb-5 border-b border-gray-200 pb-4'>
            <button
              onClick={() => toggleSection("stars")}
              className='flex items-center justify-between w-full text-left py-1'
            >
              <h4 className='text-sm font-semibold text-gray-900'>Stars</h4>
              {expandedSections.stars ? (
                <ChevronUp className='w-4 h-4 text-gray-500' />
              ) : (
                <ChevronDown className='w-4 h-4 text-gray-500' />
              )}
            </button>
            {expandedSections.stars && (
              <div className='mt-3 space-y-2'>
                {["all", "10+", "50+", "100+", "500+"].map((range) => (
                  <label
                    key={range}
                    className='flex items-center cursor-pointer group'
                  >
                    <input
                      type='radio'
                      name='starRange'
                      value={range}
                      checked={filters.starRange === range}
                      onChange={() => handleStarRangeChange(range)}
                      className='w-3.5 h-3.5 text-mf-red border-gray-300 focus:ring-mf-red'
                    />
                    <span className='ml-2 text-xs text-gray-700 group-hover:text-gray-900'>
                      {range === "all" ? "All" : `${range}`}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Contributors Count Filter */}
          <div className='mb-5 border-b border-gray-200 pb-4'>
            <button
              onClick={() => toggleSection("contributors")}
              className='flex items-center justify-between w-full text-left py-1'
            >
              <h4 className='text-sm font-semibold text-gray-900'>
                Contributors Count
              </h4>
              {expandedSections.contributors ? (
                <ChevronUp className='w-4 h-4 text-gray-500' />
              ) : (
                <ChevronDown className='w-4 h-4 text-gray-500' />
              )}
            </button>
            {expandedSections.contributors && (
              <div className='mt-3 space-y-2'>
                {["all", "5+", "10+", "20+", "50+"].map((range) => (
                  <label
                    key={range}
                    className='flex items-center cursor-pointer group'
                  >
                    <input
                      type='radio'
                      name='contributorRange'
                      value={range}
                      checked={filters.contributorRange === range}
                      onChange={() => handleContributorRangeChange(range)}
                      className='w-3.5 h-3.5 text-mf-red border-gray-300 focus:ring-mf-red'
                    />
                    <span className='ml-2 text-xs text-gray-700 group-hover:text-gray-900'>
                      {range === "all" ? "All" : `${range}`}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Technology Filter */}
          <div className='mb-5 border-b border-gray-200 pb-4'>
            <button
              onClick={() => toggleSection("technology")}
              className='flex items-center justify-between w-full text-left py-1'
            >
              <h4 className='text-sm font-semibold text-gray-900'>
                Technology
              </h4>
              {expandedSections.technology ? (
                <ChevronUp className='w-4 h-4 text-gray-500' />
              ) : (
                <ChevronDown className='w-4 h-4 text-gray-500' />
              )}
            </button>
            {expandedSections.technology && (
              <div className='mt-3 space-y-2 max-h-48 overflow-y-auto pr-1'>
                {allTechnologies.map((tech) => (
                  <label
                    key={tech}
                    className='flex items-center cursor-pointer group'
                  >
                    <input
                      type='checkbox'
                      checked={filters.technologies.includes(tech)}
                      onChange={() => handleTechnologyToggle(tech)}
                      className='w-3.5 h-3.5 text-mf-red border-gray-300 rounded focus:ring-mf-red'
                    />
                    <span className='ml-2 text-xs text-gray-700 group-hover:text-gray-900'>
                      {tech}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Tags Filter */}
          <div className='mb-5 border-b border-gray-200 pb-4'>
            <button
              onClick={() => toggleSection("tags")}
              className='flex items-center justify-between w-full text-left py-1'
            >
              <h4 className='text-sm font-semibold text-gray-900'>Tags</h4>
              {expandedSections.tags ? (
                <ChevronUp className='w-4 h-4 text-gray-500' />
              ) : (
                <ChevronDown className='w-4 h-4 text-gray-500' />
              )}
            </button>
            {expandedSections.tags && (
              <div className='mt-3 space-y-2 max-h-48 overflow-y-auto pr-1'>
                {allTags.map((tag) => (
                  <label
                    key={tag}
                    className='flex items-center cursor-pointer group'
                  >
                    <input
                      type='checkbox'
                      checked={filters.tags.includes(tag)}
                      onChange={() => handleTagToggle(tag)}
                      className='w-3.5 h-3.5 text-mf-red border-gray-300 rounded focus:ring-mf-red'
                    />
                    <span className='ml-2 text-xs text-gray-700 group-hover:text-gray-900'>
                      {tag}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar;
