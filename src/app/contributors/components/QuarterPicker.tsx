"use client";

import { useState, useRef, useEffect } from "react";
import { QuarterPickerProps } from "@/types";
import { QUARTER_PICKER_LABELS, QUARTER_NAMES } from "@/constants";

/* Quarter + Year picker dropdown */
export function QuarterPicker({
  availableQuarters,
  selectedQuarter,
  currentQuarter,
  isLoading,
  displayLabel,
  onSelect,
}: QuarterPickerProps) {
  const [open, setOpen] = useState(false);
  const [calYear, setCalYear] = useState(() =>
    Number(selectedQuarter.split("-")[0])
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableSet = new Set(availableQuarters);
  const years = Array.from(
    new Set(availableQuarters.map((q) => Number(q.split("-")[0])))
  ).sort((a, b) => a - b);
  const minYear = years[0] ?? calYear;
  const maxYear = years[years.length - 1] ?? calYear;

  useEffect(() => {
    setCalYear(Number(selectedQuarter.split("-")[0]));
  }, [selectedQuarter]);

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

  const handleQuarterClick = (qId: string) => {
    const key = `${calYear}-${qId}`;
    if (!availableSet.has(key)) return;
    onSelect(key);
    setOpen(false);
  };

  const currentYear = Number(currentQuarter.split("-")[0]);
  const currentQ = currentQuarter.split("-")[1];

  return (
    <div className='relative mt-2.5' ref={dropdownRef} data-action-btn>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className='w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all duration-150 group'
      >
        <div className='flex items-center gap-2 min-w-0'>
          {/* Quarter icon */}
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
              d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
            />
          </svg>

          {/* Selected label */}
          <span className='text-[11px] font-bold text-gray-700 group-hover:text-mf-red transition-colors truncate'>
            {isLoading ? "Loading..." : displayLabel}
          </span>
        </div>

        {/* Dropdown arrow */}
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

      {/* Dropdown panel */}
      {open && (
        <div className='absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden'>
          {/* Year navigation bar */}
          <div className='flex items-center justify-between px-3 py-2.5 border-b border-gray-100 bg-gray-50/70'>
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

            {/* Year display */}
            <div className='flex items-center gap-1.5'>
              <span className='text-[12px] font-black text-gray-800 tracking-tight'>
                {calYear}
              </span>
              {calYear === currentYear && (
                <span className='text-[8px] font-bold text-mf-red bg-red-50 border border-red-200 rounded-full px-1.5 py-0.5 uppercase tracking-wide leading-none'>
                  {QUARTER_PICKER_LABELS.nowBadge}
                </span>
              )}
            </div>

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
          </div>

          {/* Quarter buttons grid (2×2) */}
          <div className='grid grid-cols-2 gap-2 p-3'>
            {QUARTER_NAMES.map(({ id, label, months }) => {
              const key = `${calYear}-${id}`;
              const isAvailable = availableSet.has(key);
              const isSelected = key === selectedQuarter;
              const isCurrent = calYear === currentYear && id === currentQ;

              return (
                <button
                  key={key}
                  onClick={() => handleQuarterClick(id)}
                  disabled={!isAvailable}
                  className={`
                    relative flex flex-col items-center justify-center py-3 px-2 rounded-xl
                    transition-all duration-150
                    ${
                      isSelected
                        ? "bg-mf-red text-white shadow-md scale-105 ring-2 ring-red-200"
                        : isAvailable
                          ? "text-gray-700 hover:bg-red-50 hover:text-mf-red cursor-pointer border border-gray-100 hover:border-red-200"
                          : "text-gray-300 cursor-not-allowed border border-gray-100"
                    }
                  `}
                >
                  <span className='text-[13px] font-black'>{label}</span>
                  <span
                    className={`text-[9px] font-medium mt-0.5 ${
                      isSelected
                        ? "text-white/75"
                        : isAvailable
                          ? "text-gray-400"
                          : "text-gray-300"
                    }`}
                  >
                    {months}
                  </span>

                  {/* Current quarter indicator dot */}
                  {isCurrent && (
                    <span
                      className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-white/70" : "bg-mf-red animate-pulse"
                      }`}
                    />
                  )}

                  {/* Available data dot */}
                  {isAvailable && !isSelected && (
                    <span className='absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-green-400 opacity-70' />
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className='flex items-center justify-center gap-3 px-3 pb-2.5 pt-0.5'>
            <div className='flex items-center gap-1'>
              <span className='w-1.5 h-1.5 rounded-full bg-green-400' />
              <span className='text-[9px] text-gray-400 font-medium'>
                {QUARTER_PICKER_LABELS.legendHasData}
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <span className='w-1.5 h-1.5 rounded-full bg-mf-red animate-pulse' />
              <span className='text-[9px] text-gray-400 font-medium'>
                {QUARTER_PICKER_LABELS.legendCurrent}
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <span className='w-2 h-2 rounded-sm bg-mf-red' />
              <span className='text-[9px] text-gray-400 font-medium'>
                {QUARTER_PICKER_LABELS.legendSelected}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
