import FilterSection from "./FilterSection";
import { TagsFilterProps } from "@/types";

/* Filter component that allows users to select project tags */
export default function TagsFilter({
  tags,
  selected,
  isExpanded,
  onToggle,
  onChange,
}: TagsFilterProps) {
  return (
    <FilterSection title='Tags' isExpanded={isExpanded} onToggle={onToggle}>
      <div className='space-y-2 max-h-48 overflow-y-auto pr-1'>
        {tags.map((tag) => (
          <label key={tag} className='flex items-center cursor-pointer group'>
            <input
              type='checkbox'
              checked={selected.includes(tag)}
              onChange={() => onChange(tag)}
              className='w-3.5 h-3.5 text-mf-red border-gray-300 rounded focus:ring-mf-red'
            />
            <span className='ml-2 text-xs text-gray-700 group-hover:text-gray-900'>
              {tag}
            </span>
          </label>
        ))}
      </div>
    </FilterSection>
  );
}
