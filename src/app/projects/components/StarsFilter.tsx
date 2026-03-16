import FilterSection from "./FilterSection";
import { StarsFilterProps } from "@/types";
import { STAR_RANGES } from "@/constants";

/* Filter component for selecting projects based on star count ranges */
export default function StarsFilter({
  value,
  isExpanded,
  onToggle,
  onChange,
}: StarsFilterProps) {
  return (
    <FilterSection title='Stars' isExpanded={isExpanded} onToggle={onToggle}>
      <div className='space-y-2'>
        {STAR_RANGES.map((range) => (
          <label key={range} className='flex items-center cursor-pointer group'>
            <input
              type='radio'
              name='starRange'
              value={range}
              checked={value === range}
              onChange={() => onChange(range)}
              className='w-3.5 h-3.5 text-mf-red border-gray-300 focus:ring-mf-red'
            />
            <span className='ml-2 text-xs text-gray-700 group-hover:text-gray-900'>
              {range === "all" ? "All" : range}
            </span>
          </label>
        ))}
      </div>
    </FilterSection>
  );
}
