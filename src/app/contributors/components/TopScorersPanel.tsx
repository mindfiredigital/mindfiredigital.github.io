"use client";

import React from "react";
import { TopScorersPanelProps } from "@/types";
import { PANEL_HEADER } from "@/constants";
import { useTopScorersPanel } from "@/hooks/useTopScorePanel";
import PanelHeader from "./Panelheader";
import PanelBody from "./Panelbody";

/* Main panel combining header, body, and footer for leaderboard */
export default function TopScorersPanel({
  topScorers,
  onViewDetails,
}: TopScorersPanelProps) {
  const {
    containerRef,
    bodyRef,
    activeTab,
    setActiveTab,
    mobileRestOpen,
    setMobileRestOpen,
    isDownloading,
    isCopying,
    copied,
    handleDownload,
    handleCopy,
    curKey,
    availableMonths,
    selectedMonth,
    setSelectedMonth,
    isLoadingMonth,
    displayLabel,
    top10,
    podium3,
    rest,
    maxScore,
  } = useTopScorersPanel(topScorers);

  return (
    <div
      ref={containerRef}
      className='flex flex-col rounded-2xl border border-gray-100 shadow-lg bg-white overflow-hidden lg:h-full'
    >
      {/* Panel header (tabs, actions, filters) */}
      <PanelHeader
        activeTab={activeTab}
        top10Length={top10.length}
        isDownloading={isDownloading}
        isCopying={isCopying}
        copied={copied}
        onTabChange={setActiveTab}
        onDownload={handleDownload}
        onCopy={handleCopy}
        availableMonths={availableMonths}
        selectedMonth={selectedMonth}
        curKey={curKey}
        isLoadingMonth={isLoadingMonth}
        displayLabel={displayLabel}
        onMonthSelect={setSelectedMonth}
      />

      {/* Panel body (podium + rank list) */}
      <PanelBody
        bodyRef={bodyRef}
        isLoadingMonth={isLoadingMonth}
        selectedMonth={selectedMonth}
        top10={top10}
        podium3={podium3}
        rest={rest}
        maxScore={maxScore}
        displayLabel={displayLabel}
        mobileRestOpen={mobileRestOpen}
        onMobileToggle={() => setMobileRestOpen((v) => !v)}
        onViewDetails={onViewDetails}
      />

      {/* Footer hint */}
      <div className='px-5 py-2.5 border-t border-gray-100 bg-gray-50/60 flex-shrink-0'>
        <p className='text-[10px] text-center text-gray-400 font-medium uppercase tracking-wider'>
          {PANEL_HEADER.footerHint}
        </p>
      </div>

      {/* Local animation for podium crowns */}
      <style>{`
        @keyframes trophyFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
