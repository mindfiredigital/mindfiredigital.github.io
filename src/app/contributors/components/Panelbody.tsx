"use client";

import React from "react";
import { PanelBodyProps } from "@/types";
import { PANEL_HEADER } from "@/constants";
import { formatMonthKey } from "@/app/utils";
import PodiumSection from "./Podiumsection";
import RankListSection from "./Ranklistsection";

export default function PanelBody({
  bodyRef,
  isLoadingMonth,
  selectedMonth,
  top10,
  podium3,
  rest,
  maxScore,
  displayLabel,
  mobileRestOpen,
  onMobileToggle,
  onViewDetails,
}: PanelBodyProps) {
  return (
    <div
      ref={bodyRef}
      className='lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:[&::-webkit-scrollbar]:hidden lg:[-ms-overflow-style:none] lg:[scrollbar-width:none]'
    >
      {isLoadingMonth ? (
        <div className='flex flex-col items-center justify-center py-14 px-4 gap-3'>
          <svg
            className='animate-spin w-8 h-8 text-mf-red'
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
          <p className='text-xs text-gray-400 font-medium'>
            {PANEL_HEADER.loadingMonth(formatMonthKey(selectedMonth))}
          </p>
        </div>
      ) : top10.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-14 px-4 text-center gap-2'>
          <span className='text-4xl'>{PANEL_HEADER.noActivityEmoji}</span>
          <p className='text-sm font-semibold text-gray-500 mt-1'>
            {PANEL_HEADER.noActivityHeading}
          </p>
          <p className='text-xs text-gray-400'>
            {PANEL_HEADER.noActivitySubtext(displayLabel)}
          </p>
        </div>
      ) : (
        <>
          <PodiumSection podium3={podium3} onViewDetails={onViewDetails} />
          <RankListSection
            rest={rest}
            maxScore={maxScore}
            mobileRestOpen={mobileRestOpen}
            onMobileToggle={onMobileToggle}
            onViewDetails={onViewDetails}
          />
        </>
      )}
    </div>
  );
}
