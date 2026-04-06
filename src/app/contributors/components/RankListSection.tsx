"use client";

import { RankListSectionProps } from "@/types";
import { RANK_ROW_ACCENT, PANEL_HEADER } from "@/constants";
import { RankRow } from "./RankRow";

/* Displays ranked list (4–10) with desktop and mobile layouts */
export default function RankListSection({
  rest,
  maxScore,
  mobileRestOpen,
  onMobileToggle,
  onViewDetails,
}: RankListSectionProps) {
  if (rest.length === 0) return null;

  return (
    <div className='px-3 py-2 flex flex-col gap-1'>
      {/* Desktop: always visible list */}
      <div className='hidden lg:flex flex-col gap-1'>
        {rest.map((scorer, i) => (
          <RankRow
            key={scorer.username}
            scorer={scorer}
            rank={i + 4}
            pct={Math.round((scorer.total_score / maxScore) * 100)}
            accentClass={
              RANK_ROW_ACCENT[Math.min(i, RANK_ROW_ACCENT.length - 1)]
            }
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {/* Mobile: collapsible list */}
      <div className='lg:hidden flex flex-col gap-1'>
        {/* Toggle button */}
        <button
          onClick={onMobileToggle}
          className='w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:bg-red-50 hover:border-red-100 hover:text-mf-red transition-all duration-150'
        >
          <span>
            {PANEL_HEADER.mobileRanksLabel(Math.min(10, rest.length + 3))}
          </span>

          {/* Arrow icon with rotation */}
          <span
            className='transition-transform duration-300'
            style={{
              display: "inline-block",
              transform: mobileRestOpen ? "rotate(180deg)" : "rotate(0deg)",
            }}
          >
            ▾
          </span>
        </button>

        {/* Collapsible content */}
        <div
          data-mobile-rank-list
          className='overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-1'
          style={{
            maxHeight: mobileRestOpen ? `${rest.length * 56}px` : "0px",
          }}
        >
          {rest.map((scorer, i) => (
            <RankRow
              key={scorer.username}
              scorer={scorer}
              rank={i + 4}
              pct={Math.round((scorer.total_score / maxScore) * 100)}
              accentClass={
                RANK_ROW_ACCENT[Math.min(i, RANK_ROW_ACCENT.length - 1)]
              }
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
