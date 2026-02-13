"use client";

import React from "react";
import {
  GitCommit,
  GitPullRequest,
  Eye,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { TopScorer } from "@/types";

interface ContributorCardProps {
  contributor: TopScorer;
  displayRank: number;
  onViewDetails: (contributor: TopScorer) => void;
}

const getRankStyles = (rank: number) => {
  if (rank === 1)
    return {
      border: "border-yellow-300",
      glow: "shadow-yellow-100",
      badge: "bg-yellow-50 text-yellow-700 border-yellow-200",
      scoreGradient: "from-yellow-500 to-orange-500",
      label: "🥇",
      rankText: "#1",
    };
  if (rank === 2)
    return {
      border: "border-slate-300",
      glow: "shadow-slate-100",
      badge: "bg-slate-50 text-slate-600 border-slate-200",
      scoreGradient: "from-slate-500 to-slate-400",
      label: "🥈",
      rankText: "#2",
    };
  if (rank === 3)
    return {
      border: "border-orange-300",
      glow: "shadow-orange-100",
      badge: "bg-orange-50 text-orange-600 border-orange-200",
      scoreGradient: "from-orange-500 to-amber-500",
      label: "🥉",
      rankText: "#3",
    };
  return {
    border: "border-gray-100",
    glow: "",
    badge: "bg-gray-50 text-gray-500 border-gray-200",
    scoreGradient: "from-mindfire-text-red to-orange-500",
    label: "",
    rankText: `#${rank}`,
  };
};

const SCORE_BARS = [
  {
    key: "code_score" as const,
    label: "Code",
    color: "bg-blue-400",
    track: "bg-blue-100",
  },
  {
    key: "quality_score" as const,
    label: "Quality",
    color: "bg-emerald-400",
    track: "bg-emerald-100",
  },
  {
    key: "community_score" as const,
    label: "Community",
    color: "bg-violet-400",
    track: "bg-violet-100",
  },
];

export default function ContributorCard({
  contributor,
  displayRank,
  onViewDetails,
}: ContributorCardProps) {
  const rs = getRankStyles(displayRank);
  const isTopThree = displayRank <= 3;

  return (
    <div
      className={`
        group relative flex flex-col
        bg-white border ${rs.border}
        rounded-2xl overflow-hidden
        transition-all duration-300
        hover:shadow-xl hover:-translate-y-0.5 ${rs.glow}
        ${isTopThree ? "shadow-md" : "shadow-sm"}
      `}
    >
      {/* Top stripe for top-3 */}
      {isTopThree && (
        <div className={`h-0.5 w-full bg-gradient-to-r ${rs.scoreGradient}`} />
      )}

      <div className='p-5 flex flex-col flex-1'>
        {/* Header row */}
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <div className='relative'>
              <img
                src={contributor.avatar_url}
                alt={contributor.username}
                className='w-11 h-11 rounded-full ring-2 ring-gray-100 object-cover'
              />
              {/* Online-style activity dot — only for rank ≤3 */}
              {isTopThree && (
                <span className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full' />
              )}
            </div>
            <div className='min-w-0'>
              <h3 className='font-bold text-sm text-gray-900 truncate max-w-[130px] leading-tight'>
                {contributor.username}
              </h3>
              <p className='text-[11px] text-gray-400 mt-0.5'>
                {contributor.projectsWorkingOn} project
                {contributor.projectsWorkingOn !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Rank badge */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold ${rs.badge} flex-shrink-0`}
          >
            {rs.label && <span>{rs.label}</span>}
            <span>{rs.rankText}</span>
          </div>
        </div>

        {/* Score + sub-bars */}
        <div className='mb-4'>
          <div className='flex items-baseline gap-1.5 mb-3'>
            <span
              className={`text-3xl font-black bg-gradient-to-r ${rs.scoreGradient} bg-clip-text text-transparent leading-none`}
            >
              {contributor.total_score.toLocaleString()}
            </span>
            <span className='text-xs text-gray-400 font-medium'>pts</span>
          </div>

          <div className='space-y-2'>
            {SCORE_BARS.map((bar) => {
              const pct =
                contributor.total_score > 0
                  ? Math.min(
                      (contributor[bar.key] / contributor.total_score) * 100,
                      100
                    )
                  : 0;
              return (
                <div key={bar.key} className='flex items-center gap-2'>
                  <span className='text-[10px] text-gray-400 w-14 flex-shrink-0 font-medium'>
                    {bar.label}
                  </span>
                  <div
                    className={`flex-1 ${bar.track} rounded-full h-1.5 overflow-hidden`}
                  >
                    <div
                      className={`${bar.color} h-full rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className='text-[10px] text-gray-500 w-7 text-right font-semibold tabular-nums'>
                    {contributor[bar.key]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spacer */}
        <div className='flex-1' />

        {/* Stats row */}
        <div className='flex items-center justify-between pt-3.5 border-t border-gray-100 mb-3'>
          {[
            {
              icon: <GitCommit className='w-3.5 h-3.5' />,
              value: contributor.totalCommits,
              title: "Commits",
            },
            {
              icon: <GitPullRequest className='w-3.5 h-3.5' />,
              value: contributor.totalPRs,
              title: "PRs",
            },
            {
              icon: <Eye className='w-3.5 h-3.5' />,
              value: contributor.totalPRReviewsGiven,
              title: "Reviews",
            },
            {
              icon: <AlertCircle className='w-3.5 h-3.5' />,
              value: contributor.totalIssuesOpened,
              title: "Issues",
            },
          ].map((stat) => (
            <div
              key={stat.title}
              className='flex flex-col items-center gap-0.5 group/stat'
              title={stat.title}
            >
              <span className='text-gray-300 group-hover/stat:text-gray-500 transition-colors'>
                {stat.icon}
              </span>
              <span className='text-xs font-bold text-gray-700 tabular-nums'>
                {stat.value}
              </span>
              <span className='text-[9px] text-gray-400 uppercase tracking-wide'>
                {stat.title}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => onViewDetails(contributor)}
          className='w-full flex items-center justify-center gap-1.5 py-2 rounded-xl
            bg-gray-50 hover:bg-red-50
            text-gray-500 hover:text-mf-red
            text-xs font-semibold
            border border-gray-100 hover:border-red-100
            transition-all duration-200 group/btn'
        >
          View full profile
          <ArrowUpRight className='w-3.5 h-3.5 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform' />
        </button>
      </div>
    </div>
  );
}
