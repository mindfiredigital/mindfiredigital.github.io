import FilterSection from "./FilterSection";
import { ContributorsCountFilterProps } from "@/types";
import { CONTRIBUTOR_RANGES } from "@/constants";

/* Filter component for selecting projects based on contributor count ranges */
export default function ContributorsCountFilter({
  value,
  isExpanded,
  onToggle,
  onChange,
}: ContributorsCountFilterProps) {
  return (
    <FilterSection
      title='Contributors Count'
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      {/* Radio options for contributor count ranges */}
      <div className='space-y-2'>
        {CONTRIBUTOR_RANGES.map((range) => (
          <label key={range} className='flex items-center cursor-pointer group'>
            <input
              type='radio'
              name='contributorRange'
              value={range}
              checked={value === range}
              onChange={() => onChange(range)}
              className='w-3.5 h-3.5 text-mf-red border-gray-300 focus:ring-mf-red'
            />
            {/* Display label for each contributor range */}
            <span className='ml-2 text-xs text-gray-700 group-hover:text-gray-900'>
              {range === "all" ? "All" : range}
            </span>
          </label>
        ))}
      </div>
    </FilterSection>
  );
}
