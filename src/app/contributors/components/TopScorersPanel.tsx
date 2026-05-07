"use client";

import { TopScorersPanelProps } from "@/types";
import { PANEL_HEADER } from "@/constants";
import { useTopScorersPanel } from "@/hooks";
import PanelHeader from "./PanelHeader";
import PanelBody from "./PanelBody";

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
    actionPopover,
    setActionPopover,
    handleDownloadLayout,
    handleCopyLayout,
    curKey,
    availableMonths,
    selectedMonth,
    setSelectedMonth,
    isLoadingMonth,
    curQuarter,
    availableQuarters,
    selectedQuarter,
    setSelectedQuarter,
    isLoadingQuarter,
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
      <PanelHeader
        activeTab={activeTab}
        top10Length={top10.length}
        isDownloading={isDownloading}
        isCopying={isCopying}
        copied={copied}
        onTabChange={setActiveTab}
        // download button: opens popover; popover calls handleDownloadLayout(layout)
        onDownload={handleDownloadLayout}
        // copy button: opens popover; popover calls handleCopyLayout(layout)
        onCopy={handleCopyLayout}
        availableMonths={availableMonths}
        selectedMonth={selectedMonth}
        curKey={curKey}
        isLoadingMonth={isLoadingMonth}
        displayLabel={displayLabel}
        onMonthSelect={setSelectedMonth}
        availableQuarters={availableQuarters}
        selectedQuarter={selectedQuarter}
        curQuarter={curQuarter}
        isLoadingQuarter={isLoadingQuarter}
        onQuarterSelect={setSelectedQuarter}
        actionPopover={actionPopover}
        onActionPopover={setActionPopover}
      />

      <PanelBody
        bodyRef={bodyRef}
        isLoadingMonth={isLoadingMonth || isLoadingQuarter}
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

      <div className='px-5 py-2.5 border-t border-gray-100 bg-gray-50/60 flex-shrink-0'>
        <p className='text-[10px] text-center text-gray-400 font-medium uppercase tracking-wider'>
          {PANEL_HEADER.footerHint}
        </p>
      </div>

      <style>{`
        @keyframes trophyFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
