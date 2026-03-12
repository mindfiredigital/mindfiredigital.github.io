export function RadioGroup({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (val: string) => void;
  options: { id: string; label: string }[];
  activeColor?: boolean;
}) {
  return (
    <div className='space-y-1'>
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <label
            key={opt.id}
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs
              ${
                isActive
                  ? "bg-red-50 text-mf-red font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                ${isActive ? "border-mf-red" : "border-gray-300"}`}
            >
              {isActive && (
                <span className='w-1.5 h-1.5 rounded-full bg-mf-red block' />
              )}
            </span>
            <input
              type='radio'
              name={name}
              value={opt.id}
              checked={isActive}
              onChange={() => onChange(opt.id)}
              className='sr-only'
            />
            {opt.label}
          </label>
        );
      })}
    </div>
  );
}
