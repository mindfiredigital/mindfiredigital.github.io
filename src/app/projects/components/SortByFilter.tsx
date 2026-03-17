import FilterSection from "./FilterSection";
import { SortByFilterProps } from "@/types";
import { SORT_OPTIONS } from "@/constants";

/* Filter component for selecting how projects should be sorted */
export default function SortByFilter({
  value,
  isExpanded,
  onToggle,
  onChange,
}: SortByFilterProps) {
  return (
    <FilterSection title='Sort By' isExpanded={isExpanded} onToggle={onToggle}>
      <div className='space-y-2'>
        {SORT_OPTIONS.map((option) => (
          <label
            key={option.id}
            className='flex items-center cursor-pointer group'
          >
            <input
              type='radio'
              name='sortBy'
              value={option.id}
              checked={value === option.id}
              onChange={() => onChange(option.id)}
              className='w-3.5 h-3.5 text-mf-red border-gray-300 focus:ring-mf-red'
            />
            <span className='ml-2 text-xs text-gray-700 group-hover:text-gray-900'>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </FilterSection>
  );
}
