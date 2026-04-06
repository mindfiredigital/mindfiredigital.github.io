import { ChevronDown, ChevronUp } from "lucide-react";
import { FilterSectionProps } from "@/types";

// Reusable collapsible section used by every filter group in the sidebar
export default function FilterSection({
  title,
  isExpanded,
  onToggle,
  children,
}: FilterSectionProps) {
  return (
    <div className='mb-5 border-b border-gray-200 pb-4'>
      <button
        onClick={onToggle}
        className='flex items-center justify-between w-full text-left py-1'
      >
        <h4 className='text-sm font-semibold text-gray-900'>{title}</h4>
        {isExpanded ? (
          <ChevronUp className='w-4 h-4 text-gray-500' />
        ) : (
          <ChevronDown className='w-4 h-4 text-gray-500' />
        )}
      </button>
      {isExpanded && <div className='mt-3'>{children}</div>}
    </div>
  );
}
