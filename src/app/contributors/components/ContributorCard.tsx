"use client";

import { memo } from "react";
import {
  GitCommit,
  GitPullRequest,
  Eye,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { ContributorCardProps } from "@/types";
import { getRankStyles } from "@/app/utils";
import { CONTRIBUTOR_CARD_LABELS } from "@/constants";
import Image from "next/image";

/* Memoized to prevent re-renders when parent re-renders but props haven't changed */
const ContributorCard = memo(function ContributorCard({
  contributor,
  displayRank,
  onViewDetails,
}: ContributorCardProps) {
  /* Get styles based on rank */
  const rs = getRankStyles(displayRank);

  /* Check if contributor is in top 3 */
  const isTopThree = displayRank <= 3;

  return (
    <div
      className={`
        group relative flex flex-col
        bg-white border ${rs.border}
        rounded-2xl overflow-hidden
        transition-all duration-300
        hover:shadow-mf-card-hover hover:-translate-y-0.5 ${rs.glow}
        ${isTopThree ? "shadow-mf-card" : "shadow-sm"}
      `}
    >
      {/* Top 3 highlight bar — gradient via rs.scoreGradient (from-mf-red to-orange-500) */}
      {isTopThree && (
        <div className={`h-0.5 w-full bg-gradient-to-r ${rs.scoreGradient}`} />
      )}

      <div className='p-5 flex flex-col flex-1'>
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-center gap-3'>
            {/* Avatar */}
            <div className='relative flex-shrink-0'>
              <Image
                src={contributor.avatar_url}
                alt={contributor.username}
                height={44}
                width={44}
                loading='lazy'
                className='w-11 h-11 rounded-full ring-2 ring-mf-border object-cover'
              />
            </div>

            {/* Username + projects */}
            <div className='min-w-0'>
              <a
                href={contributor.html_url}
                target='_blank'
                rel='noopener noreferrer'
                className='font-bold text-sm text-mf-dark truncate max-w-[130px] leading-tight block hover:text-mf-red transition-colors duration-150'
                title={`@${contributor.username} on GitHub`}
              >
                {contributor.username}
              </a>
              <p className='text-[11px] text-mf-light-grey mt-0.5'>
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

        {/* Score section — gradient text via rs.scoreGradient */}
        <div className='mb-4'>
          <div className='flex items-baseline gap-1.5'>
            <span
              className={`text-3xl font-black bg-gradient-to-r ${rs.scoreGradient} bg-clip-text text-transparent leading-none`}
            >
              {contributor.total_score.toLocaleString()}
            </span>
            <span className='text-xs text-mf-light-grey font-medium'>
              {CONTRIBUTOR_CARD_LABELS.scoreSuffix}
            </span>
          </div>
          <p className='text-[10px] text-mf-light-grey mt-1 uppercase tracking-wide font-medium'>
            {CONTRIBUTOR_CARD_LABELS.totalScoreLabel}
          </p>
        </div>

        {/* Spacer */}
        <div className='flex-1' />

        {/* Stats section */}
        <div className='flex items-center justify-between pt-3.5 border-t border-mf-border mb-3'>
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
              <span className='text-mf-border-soft group-hover/stat:text-mf-light-grey transition-colors'>
                {stat.icon}
              </span>
              <span className='text-xs font-bold text-mf-dark tabular-nums'>
                {stat.value}
              </span>
              <span className='text-[9px] text-mf-light-grey uppercase tracking-wide'>
                {stat.title}
              </span>
            </div>
          ))}
        </div>

        {/* View profile button */}
        <button
          onClick={() => onViewDetails(contributor)}
          className='w-full flex items-center justify-center gap-1.5 py-2 rounded-xl
            bg-mf-bg-subtle hover:bg-mf-red-subtle
            text-mf-light-grey hover:text-mf-red
            text-xs font-semibold
            border border-mf-border hover:border-mf-red-border
            transition-all duration-200 group/btn'
        >
          {CONTRIBUTOR_CARD_LABELS.viewProfileLabel}
          <ArrowUpRight className='w-3.5 h-3.5 opacity-50 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform' />
        </button>
      </div>
    </div>
  );
});

/* Display name for React DevTools debugging */
ContributorCard.displayName = "ContributorCard";

export default ContributorCard;
