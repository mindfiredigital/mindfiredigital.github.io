"use client";

import React, { useState } from "react";
import Image from "next/image";
import { TopScorer } from "@/types";
import weeklyRaw from "../../projects/assets/leaderboard-weekly.json";
import monthlyRaw from "../../projects/assets/leaderboard-monthly.json";

interface TopScorersPanelProps {
  topScorers: TopScorer[];
  onViewDetails: (contributor: TopScorer) => void;
}

type Tab = "alltime" | "monthly" | "weekly";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "alltime", label: "All Time", icon: "" },
  { id: "monthly", label: "Month", icon: "" },
  { id: "weekly", label: "Week", icon: "" },
];

const PODIUM_SLOTS = [
  {
    rankIndex: 1,
    medal: "🥈",
    podiumHeight: "h-14",
    podiumGradient: "from-slate-300 to-slate-400",
    ringFrom: "#cbd5e1",
    ringTo: "#94a3b8",
    glowColor: "rgba(148,163,184,0.55)",
    // Silver crown: desaturate to grey
    crownFilter:
      "grayscale(0.6) brightness(1.3) drop-shadow(0 2px 6px rgba(148,163,184,0.9))",
    crownSize: "text-lg",
    crownDuration: "2.8s",
    avatarSize: "w-14 h-14",
    nameSz: "text-[11px]",
    scoreSz: "text-[10px]",
    scoreColor: "text-slate-500",
    podiumNum: "2",
    badgeBg: "bg-slate-400",
    selfEnd: true,
  },
  {
    rankIndex: 0,
    medal: "🥇",
    podiumHeight: "h-24",
    podiumGradient: "from-yellow-400 to-amber-500",
    ringFrom: "#fde68a",
    ringTo: "#f59e0b",
    glowColor: "rgba(251,191,36,0.65)",
    // Gold crown: natural emoji color + glow
    crownFilter: "drop-shadow(0 2px 8px rgba(251,191,36,0.9))",
    crownSize: "text-xl",
    crownDuration: "2.5s",
    avatarSize: "w-[4.25rem] h-[4.25rem]",
    nameSz: "text-xs",
    scoreSz: "text-[10px]",
    scoreColor: "text-yellow-600",
    podiumNum: "1",
    badgeBg: "bg-yellow-400",
    selfEnd: false,
  },
  {
    rankIndex: 2,
    medal: "🥉",
    podiumHeight: "h-9",
    podiumGradient: "from-orange-300 to-amber-400",
    ringFrom: "#fdba74",
    ringTo: "#f97316",
    glowColor: "rgba(249,115,22,0.45)",
    // Bronze crown: sepia + slight warm shift
    crownFilter:
      "sepia(0.8) saturate(1.2) brightness(0.85) drop-shadow(0 2px 6px rgba(180,90,20,0.8))",
    crownSize: "text-base",
    crownDuration: "3.1s",
    avatarSize: "w-12 h-12",
    nameSz: "text-[10px]",
    scoreSz: "text-[9px]",
    scoreColor: "text-orange-500",
    podiumNum: "3",
    badgeBg: "bg-orange-400",
    selfEnd: true,
  },
];

const RANK_ROW_ACCENT = [
  "text-yellow-600 bg-yellow-50 border-yellow-200",
  "text-slate-500 bg-slate-50 border-slate-200",
  "text-orange-500 bg-orange-50 border-orange-200",
  "text-gray-400 bg-gray-50 border-gray-200",
  "text-gray-400 bg-gray-50 border-gray-200",
  "text-gray-400 bg-gray-50 border-gray-200",
  "text-gray-400 bg-gray-50 border-gray-200",
];

export default function TopScorersPanel({
  topScorers,
  onViewDetails,
}: TopScorersPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("alltime");
  const [mobileRestOpen, setMobileRestOpen] = useState(false);

  const scorers: TopScorer[] =
    activeTab === "weekly"
      ? (weeklyRaw.leaderboard as unknown as TopScorer[])
      : activeTab === "monthly"
        ? (monthlyRaw.leaderboard as unknown as TopScorer[])
        : topScorers;

  const top10 = scorers.slice(0, 10);
  const podium3 = top10.slice(0, 3);
  const rest = top10.slice(3);
  const maxScore = top10[0]?.total_score ?? 1;

  return (
    <div className='flex flex-col rounded-2xl border border-gray-100 shadow-lg bg-white overflow-hidden lg:h-full'>
      {/* ── Header ── */}
      <div className='relative px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0'>
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            background:
              "radial-gradient(ellipse at 50% -30%, rgba(251,191,36,0.15) 0%, transparent 65%)",
          }}
        />

        {/* Title row */}
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
              🏆
            </span>
          </div>
          <div>
            <h3 className='text-sm font-extrabold text-gray-900 tracking-tight leading-none'>
              Hall of Fame
            </h3>
            <p className='text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-semibold'>
              Top {top10.length} Contributors
            </p>
          </div>
          <div className='ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 flex-shrink-0'>
            <span className='w-1.5 h-1.5 rounded-full bg-mf-red animate-pulse' />
            <span className='text-[10px] font-bold text-mf-red uppercase tracking-wide'>
              Live
            </span>
          </div>
        </div>

        {/* Tab pill switcher */}
        <div className='relative flex rounded-xl bg-gray-100 p-0.5 gap-0.5'>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg
                text-[11px] font-bold transition-all duration-200
                ${
                  activeTab === tab.id
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }
              `}
            >
              <span className='text-xs leading-none'>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className='lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:[&::-webkit-scrollbar]:hidden lg:[-ms-overflow-style:none] lg:[scrollbar-width:none]'>
        {top10.length === 0 ? (
          /* Empty state */
          <div className='flex flex-col items-center justify-center py-14 px-4 text-center gap-2'>
            <span className='text-4xl'>😴</span>
            <p className='text-sm font-semibold text-gray-500 mt-1'>
              No activity yet
            </p>
            <p className='text-xs text-gray-400'>
              {activeTab === "weekly"
                ? "No contributions in the last 7 days"
                : "No contributions in the last 30 days"}
            </p>
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className='relative px-4 pt-4 pb-1'>
              <div
                className='absolute inset-0 pointer-events-none'
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 100%, rgba(251,191,36,0.08) 0%, transparent 70%)",
                }}
              />
              <div className='relative flex items-end justify-center gap-2'>
                {PODIUM_SLOTS.map((slot) => {
                  const scorer = podium3[slot.rankIndex];
                  if (!scorer) return null;
                  return (
                    <button
                      key={scorer.username}
                      onClick={() => onViewDetails(scorer)}
                      className={`flex flex-col items-center group focus:outline-none ${
                        slot.selfEnd ? "self-end" : ""
                      }`}
                    >
                      {/* Crown for all top 3 */}
                      <span
                        className={`${slot.crownSize} select-none mb-1 block`}
                        style={{
                          animation: `trophyFloat ${slot.crownDuration} ease-in-out infinite`,
                          filter: slot.crownFilter,
                        }}
                      >
                        👑
                      </span>

                      <div className='relative mb-1'>
                        <div
                          className='absolute inset-0 rounded-full blur-lg scale-[1.3] opacity-75'
                          style={{ background: slot.glowColor }}
                        />
                        <div
                          className='relative p-[2.5px] rounded-full'
                          style={{
                            background: `linear-gradient(135deg, ${slot.ringFrom}, ${slot.ringTo})`,
                          }}
                        >
                          <div className='p-[2px] rounded-full bg-white'>
                            <div
                              className={`relative ${slot.avatarSize} rounded-full overflow-hidden group-hover:scale-105 transition-transform duration-300`}
                            >
                              <Image
                                src={scorer.avatar_url}
                                alt={scorer.username}
                                fill
                                className='object-cover'
                                sizes='72px'
                              />
                            </div>
                          </div>
                        </div>
                        <span
                          className={`absolute -bottom-1 -right-1 w-[22px] h-[22px] rounded-full ${slot.badgeBg} border-2 border-white flex items-center justify-center text-xs shadow-lg`}
                        >
                          {slot.medal}
                        </span>
                      </div>
                      <p
                        className={`${slot.nameSz} font-bold text-gray-800 truncate max-w-[72px] mt-2 group-hover:text-mf-red transition-colors duration-150`}
                      >
                        {scorer.username}
                      </p>
                      <p
                        className={`${slot.scoreSz} font-semibold ${slot.scoreColor} mb-2 tabular-nums`}
                      >
                        {scorer.total_score.toLocaleString()} pts
                      </p>
                      <div
                        className={`w-[72px] ${slot.podiumHeight} rounded-t-xl bg-gradient-to-b ${slot.podiumGradient} relative overflow-hidden shadow-lg`}
                      >
                        <div className='absolute top-0 left-2.5 w-2 h-full bg-white/25 -skew-x-6 rounded-full' />
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <span className='text-white/70 font-black text-xl leading-none select-none'>
                            {slot.podiumNum}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className='h-0.5 mt-1 rounded-full bg-gradient-to-r from-transparent via-gray-200 to-transparent' />
            </div>

            {/* Ranks 4–10 */}
            {rest.length > 0 && (
              <div className='px-3 py-2 flex flex-col gap-1'>
                {/* Desktop: always shown, scrolls within panel */}
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

                {/* Mobile: collapsible dropdown, page scroll handles navigation */}
                <div className='lg:hidden flex flex-col gap-1'>
                  <button
                    onClick={() => setMobileRestOpen((v) => !v)}
                    className='w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:bg-red-50 hover:border-red-100 hover:text-mf-red transition-all duration-150'
                  >
                    <span>Ranks 4–{Math.min(10, rest.length + 3)}</span>
                    <span
                      className='transition-transform duration-300'
                      style={{
                        display: "inline-block",
                        transform: mobileRestOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      ▾
                    </span>
                  </button>
                  <div
                    className='overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-1'
                    style={{
                      maxHeight: mobileRestOpen
                        ? `${rest.length * 56}px`
                        : "0px",
                    }}
                  >
                    {rest.map((scorer, i) => (
                      <RankRow
                        key={scorer.username}
                        scorer={scorer}
                        rank={i + 4}
                        pct={Math.round((scorer.total_score / maxScore) * 100)}
                        accentClass={
                          RANK_ROW_ACCENT[
                            Math.min(i, RANK_ROW_ACCENT.length - 1)
                          ]
                        }
                        onViewDetails={onViewDetails}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div className='px-5 py-2.5 border-t border-gray-100 bg-gray-50/60 flex-shrink-0'>
        <p className='text-[10px] text-center text-gray-400 font-medium uppercase tracking-wider'>
          Click any contributor to view full profile
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

function RankRow({
  scorer,
  rank,
  pct,
  accentClass,
  onViewDetails,
}: {
  scorer: TopScorer;
  rank: number;
  pct: number;
  accentClass: string;
  onViewDetails: (c: TopScorer) => void;
}) {
  return (
    <button
      onClick={() => onViewDetails(scorer)}
      className='w-full flex items-center gap-2 group rounded-xl px-2.5 py-2 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-150 text-left'
    >
      <span
        className={`flex-shrink-0 w-[22px] h-[22px] rounded-md border text-[10px] font-black flex items-center justify-center ${accentClass}`}
      >
        {rank}
      </span>
      <img
        src={scorer.avatar_url}
        alt={scorer.username}
        className='w-7 h-7 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-red-200 transition-all flex-shrink-0'
      />
      <div className='flex-1 min-w-0'>
        <p className='text-[11px] font-bold text-gray-800 truncate group-hover:text-mf-red transition-colors leading-none mb-1'>
          {scorer.username}
        </p>
        <div className='h-1 w-full bg-gray-100 rounded-full overflow-hidden'>
          <div
            className='h-full rounded-full bg-gradient-to-r from-mindfire-text-red to-orange-400 transition-all duration-700'
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className='flex-shrink-0 text-[11px] font-bold text-gray-500 group-hover:text-mf-red transition-colors tabular-nums'>
        {scorer.total_score.toLocaleString()}
      </span>
    </button>
  );
}
