"use client";

import React from "react";
import Image from "next/image";
import { PodiumSlot, PodiumSectionProps } from "@/types";
import { PANEL_HEADER } from "@/constants";

/* Configuration for each podium position (2nd, 1st, 3rd) */
export const PODIUM_SLOTS = [
  {
    rankIndex: 1,
    podiumHeight: "h-14",
    podiumGradient: "from-slate-300 to-slate-400",
    ringFrom: "#cbd5e1",
    ringTo: "#94a3b8",
    glowColor: "rgba(148,163,184,0.55)",
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
    podiumHeight: "h-24",
    podiumGradient: "from-yellow-400 to-amber-500",
    ringFrom: "#fde68a",
    ringTo: "#f59e0b",
    glowColor: "rgba(251,191,36,0.65)",
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
    podiumHeight: "h-9",
    podiumGradient: "from-orange-300 to-amber-400",
    ringFrom: "#fdba74",
    ringTo: "#f97316",
    glowColor: "rgba(249,115,22,0.45)",
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
] as const;

/* Podium UI showing top 3 contributors */
export default function PodiumSection({
  podium3,
  onViewDetails,
}: PodiumSectionProps) {
  return (
    <div className='relative px-4 pt-4 pb-1'>
      {/* Background glow effect */}
      <div
        className='absolute inset-0 pointer-events-none'
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(251,191,36,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Podium layout */}
      <div className='relative flex items-end justify-center gap-2'>
        {(PODIUM_SLOTS as readonly PodiumSlot[]).map((slot) => {
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
              {/* Crown icon */}
              <span
                className={`${slot.crownSize} select-none mb-1 block`}
                style={{
                  animation: `trophyFloat ${slot.crownDuration} ease-in-out infinite`,
                  filter: slot.crownFilter,
                }}
              >
                {PANEL_HEADER.crown}
              </span>

              {/* Avatar with glow + rank badge */}
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

                {/* Rank badge */}
                <span
                  className={`absolute -bottom-1 -right-1 w-[22px] h-[22px] rounded-full ${slot.badgeBg} border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-lg`}
                >
                  {slot.podiumNum}
                </span>
              </div>

              {/* Username */}
              <p
                className={`${slot.nameSz} font-bold text-gray-800 truncate max-w-[72px] mt-2 group-hover:text-mf-red transition-colors duration-150`}
              >
                {scorer.username}
              </p>

              {/* Score */}
              <p
                className={`${slot.scoreSz} font-semibold ${slot.scoreColor} mb-2 tabular-nums`}
              >
                {scorer.total_score.toLocaleString()} {PANEL_HEADER.scoreSuffix}
              </p>

              {/* Podium base */}
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

      {/* Bottom divider */}
      <div className='h-0.5 mt-1 rounded-full bg-gradient-to-r from-transparent via-gray-200 to-transparent' />
    </div>
  );
}
