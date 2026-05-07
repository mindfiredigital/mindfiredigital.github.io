"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { PanelHeaderProps } from "@/types";
import { CaptureLayout } from "@/hooks";
import { TABS, PANEL_HEADER } from "@/constants";

const MonthCalendarPicker = dynamic(
  () =>
    import("./MonthCalendarPicker").then((mod) => ({
      default: mod.MonthCalendarPicker,
    })),
  {
    loading: () => (
      <div className='mt-2.5 w-full h-9 rounded-xl bg-gray-100 animate-pulse' />
    ),
    ssr: false,
  }
);

const QuarterPicker = dynamic(
  () =>
    import("./QuarterPicker").then((mod) => ({
      default: mod.QuarterPicker,
    })),
  {
    loading: () => (
      <div className='mt-2.5 w-full h-9 rounded-xl bg-gray-100 animate-pulse' />
    ),
    ssr: false,
  }
);

/* Small popover with Portrait / Wide options */
function LayoutPopover({
  onSelect,
  onClose,
  isLoading,
}: {
  onSelect: (layout: CaptureLayout) => void;
  onClose: () => void;
  isLoading: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className='absolute right-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[130px]'
      style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
    >
      <p className='px-3 pt-2 pb-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest'>
        Image layout
      </p>

      {/* Portrait option */}
      <button
        disabled={isLoading}
        onClick={() => onSelect("vertical")}
        className='w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-gray-50 transition-colors duration-100 disabled:opacity-50'
      >
        {/* Portrait icon */}
        <span className='flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-gray-100'>
          <svg
            viewBox='0 0 10 14'
            className='w-2.5 h-3.5'
            fill='currentColor'
            style={{ color: "#374151" }}
          >
            <rect x='1' y='1' width='8' height='12' rx='1.5' />
          </svg>
        </span>
        <div>
          <p className='text-[11px] font-bold text-gray-800 leading-none'>
            Portrait
          </p>
          <p className='text-[9px] text-gray-400 mt-0.5'>Podium on top</p>
        </div>
      </button>

      {/* Wide option */}
      <button
        disabled={isLoading}
        onClick={() => onSelect("horizontal")}
        className='w-full flex items-center gap-2.5 px-3 py-2 pb-2.5 text-left hover:bg-gray-50 transition-colors duration-100 disabled:opacity-50'
      >
        {/* Wide icon */}
        <span className='flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md bg-gray-100'>
          <svg
            viewBox='0 0 14 10'
            className='w-3.5 h-2.5'
            fill='currentColor'
            style={{ color: "#374151" }}
          >
            <rect x='1' y='1' width='12' height='8' rx='1.5' />
          </svg>
        </span>
        <div>
          <p className='text-[11px] font-bold text-gray-800 leading-none'>
            Wide
          </p>
          <p className='text-[9px] text-gray-400 mt-0.5'>Podium on left</p>
        </div>
      </button>
    </div>
  );
}

export default function PanelHeader({
  activeTab,
  top10Length,
  isDownloading,
  isCopying,
  copied,
  onTabChange,
  onDownload,
  onCopy,
  availableMonths,
  selectedMonth,
  curKey,
  isLoadingMonth,
  displayLabel,
  onMonthSelect,
  availableQuarters,
  selectedQuarter,
  curQuarter,
  isLoadingQuarter,
  onQuarterSelect,
  customFrom,
  customTo,
  isLoadingCustom,
  onCustomFromChange,
  onCustomToChange,
  actionPopover,
  onActionPopover,
}: PanelHeaderProps) {
  const busy = isDownloading || isCopying;

  return (
    <div className='relative px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0'>
      <div
        className='absolute inset-0 pointer-events-none'
        style={{
          background:
            "radial-gradient(ellipse at 50% -30%, rgba(251,191,36,0.15) 0%, transparent 65%)",
        }}
      />

      {/* Trophy + title + live badge */}
      <div className='relative flex items-center gap-3 mb-3'>
        <div className='relative flex-shrink-0'>
          <div
            className='absolute inset-0 rounded-full blur-md'
            style={{ background: "rgba(251,191,36,0.35)" }}
          />
          <span
            className='relative text-[1.75rem] select-none leading-none'
            style={{
              filter: "drop-shadow(0 2px 10px rgba(251,191,36,0.75))",
              display: "inline-block",
              animation: "trophyFloat 3s ease-in-out infinite",
            }}
          >
            {PANEL_HEADER.trophy}
          </span>
        </div>
        <div>
          <h3 className='text-sm font-extrabold text-gray-900 tracking-tight leading-none'>
            {PANEL_HEADER.title}
          </h3>
          <p className='text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-semibold'>
            {PANEL_HEADER.topCountPrefix} {top10Length}{" "}
            {PANEL_HEADER.topCountSuffix}
          </p>
        </div>

        {/* Live indicator badge */}
        <div className='ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 flex-shrink-0'>
          <span className='w-1.5 h-1.5 rounded-full bg-mf-red animate-pulse' />
          <span className='text-[10px] font-bold text-mf-red uppercase tracking-wide'>
            {PANEL_HEADER.liveLabel}
          </span>
        </div>
      </div>

      {/* Tabs + download + copy buttons */}
      <div className='relative flex items-center gap-2'>
        <div className='flex flex-1 rounded-xl bg-gray-100 p-0.5 gap-0.5'>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Download button + popover */}
        <div className='relative flex-shrink-0'>
          <button
            aria-label={PANEL_HEADER.downloadTitle}
            data-action-btn
            onClick={() =>
              onActionPopover(actionPopover === "download" ? null : "download")
            }
            disabled={busy}
            title={PANEL_HEADER.downloadTitle}
            className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
              actionPopover === "download"
                ? "bg-mf-red border-mf-red text-white"
                : "border-mf-red text-mf-red hover:bg-mf-red hover:text-white"
            }`}
          >
            {isDownloading ? (
              <svg
                className='animate-spin w-3.5 h-3.5'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v8z'
                />
              </svg>
            ) : (
              <svg
                className='w-3.5 h-3.5'
                fill='none'
                stroke='currentColor'
                strokeWidth={2}
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 4v11'
                />
              </svg>
            )}
          </button>

          {actionPopover === "download" && (
            <LayoutPopover
              isLoading={busy}
              onSelect={onDownload}
              onClose={() => onActionPopover(null)}
            />
          )}
        </div>

        {/* Copy button + popover */}
        <div className='relative flex-shrink-0'>
          <button
            aria-label={PANEL_HEADER.copyTitle}
            data-action-btn
            onClick={() =>
              onActionPopover(actionPopover === "copy" ? null : "copy")
            }
            disabled={busy}
            title={copied ? PANEL_HEADER.copiedTitle : PANEL_HEADER.copyTitle}
            className={`w-7 h-7 flex items-center justify-center rounded-lg border transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
              copied
                ? "border-green-500 text-green-500 bg-green-50"
                : actionPopover === "copy"
                  ? "bg-mf-red border-mf-red text-white"
                  : "border-mf-red text-mf-red hover:bg-mf-red hover:text-white"
            }`}
          >
            {isCopying ? (
              <svg
                className='animate-spin w-3.5 h-3.5'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v8z'
                />
              </svg>
            ) : copied ? (
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
                  d='M5 13l4 4L19 7'
                />
              </svg>
            ) : (
              <svg
                className='w-3.5 h-3.5'
                fill='none'
                stroke='currentColor'
                strokeWidth={2}
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                />
              </svg>
            )}
          </button>

          {actionPopover === "copy" && (
            <LayoutPopover
              isLoading={busy}
              onSelect={onCopy}
              onClose={() => onActionPopover(null)}
            />
          )}
        </div>
      </div>

      {activeTab === "monthly" && (
        <MonthCalendarPicker
          availableMonths={availableMonths}
          selectedMonth={selectedMonth}
          currentMonth={curKey}
          isLoading={isLoadingMonth}
          displayLabel={displayLabel}
          onSelect={onMonthSelect}
        />
      )}

      {activeTab === "quarterly" && (
        <QuarterPicker
          availableQuarters={availableQuarters}
          selectedQuarter={selectedQuarter}
          currentQuarter={curQuarter}
          isLoading={isLoadingQuarter}
          displayLabel={displayLabel}
          onSelect={onQuarterSelect}
        />
      )}

      {activeTab === "custom" && (
        <div className='mt-2.5 flex items-center gap-2'>
          <div className='flex-1 flex flex-col gap-0.5'>
            <label className='text-[9px] font-bold text-gray-400 uppercase tracking-widest px-0.5'>
              From
            </label>
            <input
              type='date'
              value={customFrom}
              max={customTo}
              onChange={(e) => onCustomFromChange(e.target.value)}
              className='w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-mf-red/30 focus:border-mf-red transition-colors'
            />
          </div>
          <div className='flex-shrink-0 mt-4 text-gray-300 font-bold text-sm'>
            →
          </div>
          <div className='flex-1 flex flex-col gap-0.5'>
            <label className='text-[9px] font-bold text-gray-400 uppercase tracking-widest px-0.5'>
              To
            </label>
            <input
              type='date'
              value={customTo}
              min={customFrom}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => onCustomToChange(e.target.value)}
              className='w-full rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-mf-red/30 focus:border-mf-red transition-colors'
            />
          </div>
          {isLoadingCustom && (
            <div className='flex-shrink-0 mt-4'>
              <svg
                className='animate-spin w-4 h-4 text-mf-red'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v8z'
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
