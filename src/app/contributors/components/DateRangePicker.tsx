"use client";

import { useDateRangePicker } from "@/hooks";
import { CALENDAR_PICKER_LABELS } from "@/constants";

const DAY_NAMES = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className='w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200'
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
      fill='none'
      stroke='currentColor'
      strokeWidth={2}
      viewBox='0 0 24 24'
    >
      <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
    </svg>
  );
}

function ChevronLeft() {
  return (
    <svg
      className='w-3.5 h-3.5'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.5}
      viewBox='0 0 24 24'
    >
      <path strokeLinecap='round' strokeLinejoin='round' d='M15 19l-7-7 7-7' />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      className='w-3.5 h-3.5'
      fill='none'
      stroke='currentColor'
      strokeWidth={2.5}
      viewBox='0 0 24 24'
    >
      <path strokeLinecap='round' strokeLinejoin='round' d='M9 5l7 7-7 7' />
    </svg>
  );
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${MONTH_NAMES[Number(m) - 1].slice(0, 3)} ${Number(d)}, ${y}`;
}

export function DateRangePicker({
  fromDate,
  toDate,
  isLoading,
  onFromChange,
  onToChange,
}: {
  fromDate: string;
  toDate: string;
  isLoading: boolean;
  onFromChange: (d: string) => void;
  onToChange: (d: string) => void;
}) {
  const {
    openPanel,
    setOpenPanel,
    calYear,
    calMonth,
    yearPickerOpen,
    setYearPickerOpen,
    dropdownRef,
    years,
    minYear,
    maxYear,
    prevMonth,
    nextMonth,
    buildDayGrid,
    getDayState,
    handleDayClick,
    handleYearSelect,
  } = useDateRangePicker(fromDate, toDate, onFromChange, onToChange);

  const cells = buildDayGrid();
  const isOpen = openPanel !== null;

  return (
    <div className='relative mt-2.5' ref={dropdownRef} data-action-btn>
      {/* Trigger — same shape as MonthCalendarPicker trigger */}
      <button
        onClick={() => setOpenPanel(isOpen ? null : "from")}
        className='w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all duration-150 group'
      >
        <div className='flex items-center gap-2 min-w-0'>
          <CalendarIcon className='w-3.5 h-3.5 text-mf-red flex-shrink-0' />
          {isLoading ? (
            <span className='text-[11px] font-bold text-gray-400'>
              Computing…
            </span>
          ) : (
            <span className='text-[11px] font-bold text-gray-700 group-hover:text-mf-red transition-colors truncate'>
              <span
                className={`cursor-pointer underline-offset-2 ${
                  openPanel === "from" ? "text-mf-red underline" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPanel(openPanel === "from" ? null : "from");
                }}
              >
                {formatDate(fromDate)}
              </span>
              <span className='mx-1.5 text-gray-400 font-normal'>→</span>
              <span
                className={`cursor-pointer underline-offset-2 ${
                  openPanel === "to" ? "text-mf-red underline" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPanel(openPanel === "to" ? null : "to");
                }}
              >
                {formatDate(toDate)}
              </span>
            </span>
          )}
        </div>
        <ChevronDown open={isOpen} />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className='absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden'>
          {/* From / To selector tabs */}
          <div className='flex border-b border-gray-100'>
            {(["from", "to"] as const).map((side) => (
              <button
                key={side}
                onClick={() => setOpenPanel(side)}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
                  openPanel === side
                    ? "text-mf-red bg-red-50 border-b-2 border-mf-red"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {side === "from"
                  ? `From · ${formatDate(fromDate)}`
                  : `To · ${formatDate(toDate)}`}
              </button>
            ))}
          </div>

          {/* Year / month nav bar */}
          <div className='flex items-center justify-between px-3 py-2.5 border-b border-gray-100 bg-gray-50/70'>
            {!yearPickerOpen ? (
              <>
                <button
                  onClick={prevMonth}
                  disabled={calYear <= minYear && calMonth <= 1}
                  className='w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all'
                >
                  <ChevronLeft />
                </button>

                <button
                  onClick={() => setYearPickerOpen(true)}
                  className='flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-red-50 hover:text-mf-red transition-all duration-150 group/yr'
                >
                  <span className='text-[12px] font-black text-gray-800 group-hover/yr:text-mf-red tracking-tight transition-colors'>
                    {MONTH_NAMES[calMonth - 1]}, {calYear}
                  </span>
                  {calYear === new Date().getUTCFullYear() &&
                    calMonth === new Date().getUTCMonth() + 1 && (
                      <span className='text-[8px] font-bold text-mf-red bg-red-50 border border-red-200 rounded-full px-1.5 py-0.5 uppercase tracking-wide leading-none'>
                        {CALENDAR_PICKER_LABELS.nowBadge}
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
                  onClick={nextMonth}
                  disabled={
                    calYear >= maxYear &&
                    calMonth >= new Date().getUTCMonth() + 1
                  }
                  className='w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all'
                >
                  <ChevronRight />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setYearPickerOpen(false)}
                  className='w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-all'
                >
                  <ChevronLeft />
                </button>
                <span className='text-[11px] font-black text-gray-700 uppercase tracking-widest'>
                  {CALENDAR_PICKER_LABELS.selectYearHeading}
                </span>
                <div className='w-6' />
              </>
            )}
          </div>

          {/* Year picker grid */}
          {yearPickerOpen ? (
            <div className='grid grid-cols-3 gap-1.5 p-3'>
              {years.map((year) => {
                const isSelectedYear = year === calYear;
                const isCurrentYear = year === new Date().getUTCFullYear();
                return (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={`relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-[12px] font-bold transition-all duration-150 ${
                      isSelectedYear
                        ? "bg-mf-red text-white shadow-md scale-105 ring-2 ring-red-200"
                        : "text-gray-700 hover:bg-red-50 hover:text-mf-red hover:scale-105 cursor-pointer"
                    }`}
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
            <>
              {/* Day-of-week header */}
              <div className='grid grid-cols-7 px-2.5 pt-2.5 pb-1'>
                {DAY_NAMES.map((n) => (
                  <div
                    key={n}
                    className='text-center text-[9px] font-black text-gray-400 uppercase tracking-widest py-0.5'
                  >
                    {n}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className='grid grid-cols-7 gap-y-0.5 px-2.5 pb-2.5'>
                {cells.map((day, idx) => {
                  const state = getDayState(day);
                  if (state === "empty") {
                    return <div key={idx} />;
                  }

                  const isFrom = state === "from";
                  const isTo = state === "to";
                  const inRange = state === "in-range";
                  const isFuture = state === "future";
                  const isToday = state === "today";

                  return (
                    <button
                      key={idx}
                      disabled={isFuture}
                      onClick={() => handleDayClick(day!)}
                      className={`
                        relative flex items-center justify-center h-7 rounded-lg text-[11px] font-bold
                        transition-all duration-100
                        ${
                          isFrom || isTo
                            ? "bg-mf-red text-white shadow-md scale-105 z-10"
                            : inRange
                              ? "bg-red-50 text-mf-red rounded-none"
                              : isFuture
                                ? "text-gray-200 cursor-not-allowed"
                                : isToday
                                  ? "text-mf-red font-black hover:bg-red-50 cursor-pointer"
                                  : "text-gray-700 hover:bg-red-50 hover:text-mf-red cursor-pointer"
                        }
                      `}
                    >
                      {day}
                      {/* Today indicator dot */}
                      {isToday && !isFrom && !isTo && (
                        <span className='absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-mf-red' />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className='flex items-center justify-center gap-3 px-3 pb-2.5 pt-0.5 border-t border-gray-50'>
                <div className='flex items-center gap-1'>
                  <span className='w-2 h-2 rounded-sm bg-mf-red' />
                  <span className='text-[9px] text-gray-400 font-medium'>
                    Selected
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='w-2 h-2 rounded-sm bg-red-50 border border-red-200' />
                  <span className='text-[9px] text-gray-400 font-medium'>
                    In range
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='w-1.5 h-1.5 rounded-full bg-mf-red' />
                  <span className='text-[9px] text-gray-400 font-medium'>
                    Today
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
