import { MONTH_NAMES_SHORT } from "@/constants";
import { useEffect, useRef, useState } from "react";

export function MonthCalendarPicker({
  availableMonths,
  selectedMonth,
  currentMonth,
  isLoading,
  displayLabel,
  onSelect,
}: {
  availableMonths: string[];
  selectedMonth: string;
  currentMonth: string;
  isLoading: boolean;
  displayLabel: string;
  onSelect: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [calYear, setCalYear] = useState(() => {
    const [y] = selectedMonth.split("-");
    return Number(y);
  });
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableSet = new Set(availableMonths);
  const years = Array.from(
    new Set(availableMonths.map((k) => Number(k.split("-")[0])))
  ).sort((a, b) => a - b);
  const minYear = years[0] ?? calYear;
  const maxYear = years[years.length - 1] ?? calYear;

  useEffect(() => {
    const [y] = selectedMonth.split("-");
    setCalYear(Number(y));
  }, [selectedMonth]);

  useEffect(() => {
    if (!open) setYearPickerOpen(false);
  }, [open]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleMonthClick = (monthIdx: number) => {
    const key = `${calYear}-${String(monthIdx + 1).padStart(2, "0")}`;
    if (!availableSet.has(key)) return;
    onSelect(key);
    setOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setCalYear(year);
    setYearPickerOpen(false);
  };

  return (
    <div className='relative mt-2.5' ref={dropdownRef} data-action-btn>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className='w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all duration-150 group'
      >
        <div className='flex items-center gap-2 min-w-0'>
          <svg
            className='w-3.5 h-3.5 text-mf-red flex-shrink-0'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
          <span className='text-[11px] font-bold text-gray-700 group-hover:text-mf-red transition-colors truncate'>
            {isLoading ? "Loading…" : displayLabel}
          </span>
        </div>
        <svg
          className='w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200'
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {open && (
        <div className='absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden'>
          {/* ── Year navigation bar ── */}
          <div className='flex items-center justify-between px-3 py-2.5 border-b border-gray-100 bg-gray-50/70'>
            {!yearPickerOpen ? (
              <>
                <button
                  onClick={() => setCalYear((y) => Math.max(y - 1, minYear))}
                  disabled={calYear <= minYear}
                  className='w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all'
                >
                  <svg
                    className='w-3.5 h-3.5'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2.5}
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15 19l-7-7 7-7'
                    />
                  </svg>
                </button>

                {/* Clickable year — opens year picker */}
                <button
                  onClick={() => setYearPickerOpen(true)}
                  className='flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-red-50 hover:text-mf-red transition-all duration-150 group/yr'
                >
                  <span className='text-[12px] font-black text-gray-800 group-hover/yr:text-mf-red tracking-tight transition-colors'>
                    {calYear}
                  </span>
                  {calYear === Number(currentMonth.split("-")[0]) && (
                    <span className='text-[8px] font-bold text-mf-red bg-red-50 border border-red-200 rounded-full px-1.5 py-0.5 uppercase tracking-wide leading-none'>
                      Now
                    </span>
                  )}
                  <svg
                    className='w-3 h-3 text-gray-400 group-hover/yr:text-mf-red transition-colors'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2.5}
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>

                <button
                  onClick={() => setCalYear((y) => Math.min(y + 1, maxYear))}
                  disabled={calYear >= maxYear}
                  className='w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all'
                >
                  <svg
                    className='w-3.5 h-3.5'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2.5}
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setYearPickerOpen(false)}
                  className='w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-all'
                >
                  <svg
                    className='w-3.5 h-3.5'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2.5}
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M15 19l-7-7 7-7'
                    />
                  </svg>
                </button>
                <span className='text-[11px] font-black text-gray-700 uppercase tracking-widest'>
                  Select Year
                </span>
                <div className='w-6' />
              </>
            )}
          </div>

          {/* ── Year picker grid ── */}
          {yearPickerOpen ? (
            <div className='grid grid-cols-3 gap-1.5 p-3'>
              {years.map((year) => {
                const isSelectedYear = year === calYear;
                const isCurrentYear =
                  year === Number(currentMonth.split("-")[0]);
                return (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={`
                      relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl
                      text-[12px] font-bold transition-all duration-150
                      ${
                        isSelectedYear
                          ? "bg-mf-red text-white shadow-md scale-105 ring-2 ring-red-200"
                          : "text-gray-700 hover:bg-red-50 hover:text-mf-red hover:scale-105 cursor-pointer"
                      }
                    `}
                  >
                    {year}
                    {isCurrentYear && (
                      <span
                        className={`mt-0.5 w-1 h-1 rounded-full ${
                          isSelectedYear
                            ? "bg-white/70"
                            : "bg-mf-red animate-pulse"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className='grid grid-cols-4 gap-1 p-2.5'>
              {MONTH_NAMES_SHORT.map((name, idx) => {
                const key = `${calYear}-${String(idx + 1).padStart(2, "0")}`;
                const isAvailable = availableSet.has(key);
                const isSelected = key === selectedMonth;
                const isCurrent = key === currentMonth;

                return (
                  <button
                    key={key}
                    onClick={() => handleMonthClick(idx)}
                    disabled={!isAvailable}
                    className={`
                      relative flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold
                      transition-all duration-150
                      ${
                        isSelected
                          ? "bg-mf-red text-white shadow-md scale-105"
                          : isAvailable
                            ? "text-gray-700 hover:bg-red-50 hover:text-mf-red cursor-pointer"
                            : "text-gray-300 cursor-not-allowed"
                      }
                    `}
                  >
                    {name}
                    {isCurrent && (
                      <span
                        className={`mt-0.5 w-1 h-1 rounded-full ${
                          isSelected ? "bg-white/70" : "bg-mf-red"
                        }`}
                      />
                    )}
                    {isAvailable && !isSelected && (
                      <span className='absolute top-1 right-1 w-1 h-1 rounded-full bg-green-400 opacity-70' />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {!yearPickerOpen && (
            <div className='flex items-center justify-center gap-3 px-3 pb-2.5 pt-0.5'>
              <div className='flex items-center gap-1'>
                <span className='w-1.5 h-1.5 rounded-full bg-green-400' />
                <span className='text-[9px] text-gray-400 font-medium'>
                  Has data
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <span className='w-1.5 h-1.5 rounded-full bg-mf-red' />
                <span className='text-[9px] text-gray-400 font-medium'>
                  Current month
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <span className='w-2 h-2 rounded-sm bg-mf-red' />
                <span className='text-[9px] text-gray-400 font-medium'>
                  Selected
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
