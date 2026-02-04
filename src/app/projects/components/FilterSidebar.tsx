import React, { useState } from "react";
import { Search, ChevronDown, ChevronUp, X } from "lucide-react";

interface Contributor {
  id: number;
  login: string;
  contributions: number;
  html_url: string;
  avatar_url: string;
}

interface Filters {
  tags: string[];
  technologies: string[];
  starRange: string;
  contributorRange: string;
  selectedContributor: string;
}

interface FilterSidebarProps {
  allTags: string[];
  allTechnologies: string[];
  contributors: Contributor[];
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  onReset: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  allTags,
  allTechnologies,
  contributors,
  filters,
  onFilterChange,
  onReset,
  searchQuery,
  onSearchChange,
}) => {
  const [expandedSections, setExpandedSections] = useState({
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
    onFilterChange({
      selectedContributor: filters.selectedContributor === login ? "" : login,
    });
  };

  const filteredContributors = contributors.filter((contributor) =>
    contributor.login.toLowerCase().includes(contributorSearch.toLowerCase())
  );

  const activeFiltersCount =
    filters.tags.length +
    filters.technologies.length +
    (filters.starRange !== "all" ? 1 : 0) +
    (filters.contributorRange !== "all" ? 1 : 0) +
    (filters.selectedContributor ? 1 : 0);

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-5'>
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

      {/* Technology Filter */}
      <div className='mb-5 border-b border-gray-200 pb-4'>
        <button
          onClick={() => toggleSection("technology")}
          className='flex items-center justify-between w-full text-left py-1'
        >
          <h4 className='text-sm font-semibold text-gray-900'>Technology</h4>
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
                  {range === "all" ? "All Stars" : `${range} Stars`}
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
          <h4 className='text-sm font-semibold text-gray-900'>Contributors</h4>
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
                  {range === "all"
                    ? "All Contributors"
                    : `${range} Contributors`}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Contributors List */}
      <div>
        <button
          onClick={() => toggleSection("contributorList")}
          className='flex items-center justify-between w-full text-left py-1'
        >
          <h4 className='text-sm font-semibold text-gray-900'>
            Filter by Contributor
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

            {/* Contributor List */}
            <div className='max-h-72 overflow-y-auto space-y-1.5'>
              {filteredContributors.slice(0, 50).map((contributor) => (
                <button
                  key={contributor.id}
                  onClick={() => handleContributorSelect(contributor.login)}
                  className={`w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-gray-50 transition-colors ${
                    filters.selectedContributor === contributor.login
                      ? "bg-red-50 border border-mf-red"
                      : "border border-transparent"
                  }`}
                >
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.login}
                    className='w-7 h-7 rounded-full flex-shrink-0'
                  />
                  <div className='flex-1 text-left overflow-hidden min-w-0'>
                    <p className='text-xs font-medium text-gray-900 truncate'>
                      {contributor.login}
                    </p>
                    <p className='text-[10px] text-gray-500'>
                      {contributor.contributions} contributions
                    </p>
                  </div>
                </button>
              ))}
              {filteredContributors.length > 50 && (
                <p className='text-[10px] text-gray-500 text-center py-2'>
                  Showing top 50 contributors
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
