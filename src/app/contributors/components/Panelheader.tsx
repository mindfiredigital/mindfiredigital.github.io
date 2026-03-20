"use client";

import React from "react";
import dynamic from "next/dynamic";
import { PanelHeaderProps } from "@/types";
import { TABS, PANEL_HEADER } from "@/constants";

/* Dynamically imported — only needed when user switches to monthly tab */
/* Named export requires .then() remapping for Next.js dynamic to work */
const MonthCalendarPicker = dynamic(
  () =>
    import("./MonthCalendarPicker").then((mod) => ({
      default: mod.MonthCalendarPicker,
    })),
  {
    /* Pulse placeholder matching the trigger button height while loading */
    loading: () => (
      <div className='mt-2.5 w-full h-9 rounded-xl bg-gray-100 animate-pulse' />
    ),
    /* No SSR — purely interactive client-only dropdown with refs and state */
    ssr: false,
  }
);

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
}: PanelHeaderProps) {
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

        {/* Download button */}
        <button
          aria-label={PANEL_HEADER.downloadTitle}
          data-action-btn
          onClick={onDownload}
          disabled={isDownloading || isCopying}
          title={PANEL_HEADER.downloadTitle}
          className='flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg border border-mf-red text-mf-red hover:bg-mf-red hover:text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
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

        {/* Copy button */}
        <button
          aria-label={PANEL_HEADER.downloadTitle}
          data-action-btn
          onClick={onCopy}
          disabled={isCopying || isDownloading}
          title={copied ? PANEL_HEADER.copiedTitle : PANEL_HEADER.copyTitle}
          className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg border transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
            copied
              ? "border-green-500 text-green-500 bg-green-50"
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
      </div>

      {/* Monthly calendar picker — dynamically loaded only when monthly tab is active */}
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
    </div>
  );
}
