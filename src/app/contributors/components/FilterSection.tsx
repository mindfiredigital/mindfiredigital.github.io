import { ChevronDown, ChevronUp } from "lucide-react";

/* Collapsible filter section component */
export function FilterSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className='rounded-lg overflow-hidden'>
      {/* Section header with toggle */}
      <button
        onClick={onToggle}
        className='flex items-center justify-between w-full px-3 py-2.5 text-left hover:bg-gray-50 rounded-lg transition-colors'
      >
        <span className='text-xs font-bold text-gray-700 uppercase tracking-wider'>
          {title}
        </span>

        {/* Toggle icon based on expanded state */}
        {expanded ? (
          <ChevronUp className='w-3.5 h-3.5 text-gray-400' />
        ) : (
          <ChevronDown className='w-3.5 h-3.5 text-gray-400' />
        )}
      </button>

      {/* Render children when expanded */}
      {expanded && <div className='px-3 pb-3 pt-1'>{children}</div>}
    </div>
  );
}
