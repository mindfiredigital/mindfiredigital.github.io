import { useState } from "react";
import { Search, X } from "lucide-react";
import FilterSection from "./FilterSection";
import { ContributorsFilterProps } from "@/types";
import { PROJECT_SIDEBAR } from "@/constants";

/* Filter component for selecting contributors with search and multi-select support */
export default function ContributorsFilter({
  contributors,
  selected,
  isExpanded,
  onToggle,
  onSelect,
  onClearAll,
}: ContributorsFilterProps) {
  const [contributorSearch, setContributorSearch] = useState("");

  const filtered = contributors.filter((c) =>
    c.login.toLowerCase().includes(contributorSearch.toLowerCase())
  );

  const title = `Contributors${
    selected.length > 0 ? ` (${selected.length})` : ""
  }`;

  return (
    <FilterSection title={title} isExpanded={isExpanded} onToggle={onToggle}>
      {/* Contributor search input */}
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

      {/* Selected contributor chips */}
      {selected.length > 0 && (
        <div className='mb-3 p-2 bg-red-50 rounded-md border border-red-200'>
          <div className='flex items-center justify-between mb-1.5'>
            <p className='text-[10px] text-gray-600 font-medium'>Selected:</p>
            <button
              onClick={onClearAll}
              className='text-[10px] text-mf-red hover:text-red-800 font-medium flex items-center gap-0.5'
            >
              <X className='w-3 h-3' />
              {PROJECT_SIDEBAR.CLEAR}
            </button>
          </div>
          <div className='flex flex-wrap gap-1.5'>
            {selected.map((login) => {
              const contributor = contributors.find((c) => c.login === login);
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
                  <span className='text-gray-900 font-medium'>{login}</span>
                  <button
                    onClick={() => onSelect(login)}
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

      {/* Contributor list */}
      <div className='max-h-72 overflow-y-auto space-y-1.5'>
        {filtered.slice(0, 50).map((contributor) => (
          <label
            key={contributor.id}
            className='w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-gray-50 transition-colors cursor-pointer border border-transparent'
          >
            <input
              type='checkbox'
              checked={selected.includes(contributor.login)}
              onChange={() => onSelect(contributor.login)}
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
        {filtered.length > 50 && (
          <p className='text-[10px] text-gray-500 text-center py-2'>
            {PROJECT_SIDEBAR.FIRST_50}
          </p>
        )}
      </div>
    </FilterSection>
  );
}
