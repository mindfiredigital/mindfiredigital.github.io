import { Search, X } from "lucide-react";
import { FilterSidebarHeaderProps } from "@/types";

// Sticky header section of the sidebar — always visible while filters scroll below
export default function FilterSidebarHeader({
  activeFiltersCount,
  searchQuery,
  onSearchChange,
  onReset,
}: FilterSidebarHeaderProps) {
  return (
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

      {/* Project search box */}
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
  );
}
