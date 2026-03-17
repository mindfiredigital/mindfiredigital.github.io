import FilterSection from "./FilterSection";
import { TechnologyFilterProps } from "@/types";

/* Filter component that allows users to select technologies */
export default function TechnologyFilter({
  technologies,
  selected,
  isExpanded,
  onToggle,
  onChange,
}: TechnologyFilterProps) {
  return (
    <FilterSection
      title='Technology'
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <div className='space-y-2 max-h-48 overflow-y-auto pr-1'>
        {technologies.map((tech) => (
          <label key={tech} className='flex items-center cursor-pointer group'>
            <input
              type='checkbox'
              checked={selected.includes(tech)}
              onChange={() => onChange(tech)}
              className='w-3.5 h-3.5 text-mf-red border-gray-300 rounded focus:ring-mf-red'
            />
            <span className='ml-2 text-xs text-gray-700 group-hover:text-gray-900'>
              {tech}
            </span>
          </label>
        ))}
      </div>
    </FilterSection>
  );
}
