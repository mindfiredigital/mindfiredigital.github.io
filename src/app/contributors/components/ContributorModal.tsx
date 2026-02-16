"use client";

import React, { useEffect } from "react";
import {
  X,
  ExternalLink,
  GitPullRequest,
  GitCommit,
  Eye,
  AlertCircle,
  MessageSquare,
  Github,
} from "lucide-react";
import { TopScorer } from "@/types";

interface ContributorModalProps {
  contributor: TopScorer | null;
  onClose: () => void;
}

const SCORE_BARS = [
  {
    key: "code_score" as const,
    label: "Code",
    color: "bg-blue-400",
    track: "bg-blue-100",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
  },
  {
    key: "quality_score" as const,
    label: "Quality",
    color: "bg-emerald-400",
    track: "bg-emerald-100",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50 border-emerald-200",
  },
  {
    key: "community_score" as const,
    label: "Community",
    color: "bg-violet-400",
    track: "bg-violet-100",
    textColor: "text-violet-700",
    bgColor: "bg-violet-50 border-violet-200",
  },
];

const ContributorModal: React.FC<ContributorModalProps> = ({
  contributor,
  onClose,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!contributor) return null;

  const { score_breakdown, prs_by_complexity } = contributor;
  const totalPRs = contributor.totalPRs || 1;
  const smallPct = Math.round((prs_by_complexity.small / totalPRs) * 100);
  const mediumPct = Math.round((prs_by_complexity.medium / totalPRs) * 100);
  const largePct = Math.round((prs_by_complexity.large / totalPRs) * 100);

  const scoreItems = [
    { label: "PR Score", value: score_breakdown.pr_score },
    { label: "Commits Score", value: score_breakdown.commits_score },
    { label: "PR Reviews", value: score_breakdown.pr_reviews_score },
    { label: "Code Comments", value: score_breakdown.code_comments_score },
    { label: "Issues Opened", value: score_breakdown.issues_opened_score },
    { label: "Issue Comments", value: score_breakdown.issue_comments_score },
    { label: "Tests", value: score_breakdown.tests_score },
    { label: "Docs", value: score_breakdown.docs_score },
    { label: "Mentor", value: score_breakdown.mentor_score },
    { label: "Zero Revisions", value: score_breakdown.zero_revisions_score },
    { label: "Impact Bonus", value: score_breakdown.impact_bonus_score },
  ];

  const maxScore = Math.max(...scoreItems.map((s) => s.value), 1);

  const getRankBadge = (rank: number) => {
    if (rank === 1)
      return {
        label: "🥇 #1",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
      };
    if (rank === 2)
      return {
        label: "🥈 #2",
        color: "bg-gray-100 text-gray-600 border-gray-300",
      };
    if (rank === 3)
      return {
        label: "🥉 #3",
        color: "bg-orange-100 text-orange-600 border-orange-300",
      };
    return {
      label: `#${rank}`,
      color: "bg-slate-100 text-slate-600 border-slate-300",
    };
  };

  const badge = getRankBadge(contributor.rank);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black bg-opacity-50'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10'>
        {/* Header */}
        <div className='sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-gray-100'>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100'
          >
            <X className='w-5 h-5' />
          </button>

          <div className='flex items-center gap-4'>
            {/* Avatar with gradient ring */}
            <div className='relative flex-shrink-0'>
              <div className='p-0.5 rounded-full bg-gradient-to-tr from-mindfire-text-red via-orange-500 to-yellow-500'>
                <div className='p-0.5 rounded-full bg-white'>
                  <img
                    src={contributor.avatar_url}
                    alt={contributor.username}
                    className='w-16 h-16 rounded-full object-cover'
                  />
                </div>
              </div>
              <span
                className={`absolute -bottom-1 -right-1 text-xs font-bold px-1.5 py-0.5 rounded-full border ${badge.color}`}
              >
                {contributor.rank <= 3
                  ? badge.label.split(" ")[0]
                  : badge.label}
              </span>
            </div>

            <div>
              <div className='flex items-center gap-2 flex-wrap'>
                <h2 className='text-xl font-bold text-gray-900'>
                  {contributor.username}
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badge.color}`}
                >
                  {badge.label}
                </span>
              </div>
              {/* GitHub link — icon + text */}
              <a
                href={contributor.html_url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1.5 mt-1.5 text-sm font-medium text-gray-500 hover:text-mf-red transition-colors group'
              >
                <Github className='w-4 h-4 group-hover:scale-110 transition-transform' />
                <span>View GitHub Profile</span>
                <ExternalLink className='w-3 h-3' />
              </a>
            </div>
          </div>
        </div>

        <div className='p-6 space-y-6'>
          {/* Score Summary Tiles */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {[
              {
                label: "Total Score",
                value: contributor.total_score,
                color: "bg-red-50 border-red-200 text-mindfire-text-red",
              },
              {
                label: "Code Score",
                value: contributor.code_score,
                color: "bg-blue-50 border-blue-200 text-blue-700",
              },
              {
                label: "Quality Score",
                value: contributor.quality_score,
                color: "bg-green-50 border-green-200 text-green-700",
              },
              {
                label: "Community Score",
                value: contributor.community_score,
                color: "bg-purple-50 border-purple-200 text-purple-700",
              },
            ].map((tile) => (
              <div
                key={tile.label}
                className={`border rounded-xl p-3 text-center ${tile.color}`}
              >
                <p className='text-2xl font-bold'>
                  {tile.value.toLocaleString()}
                </p>
                <p className='text-xs mt-0.5 opacity-80'>{tile.label}</p>
              </div>
            ))}
          </div>

          {/* Score Composition Bars (moved from card) */}
          <div>
            <h3 className='text-sm font-semibold text-gray-700 mb-3'>
              Score Composition
            </h3>
            <div className='space-y-2.5'>
              {SCORE_BARS.map((bar) => {
                const pct =
                  contributor.total_score > 0
                    ? Math.min(
                        (contributor[bar.key] / contributor.total_score) * 100,
                        100
                      )
                    : 0;
                return (
                  <div key={bar.key} className='flex items-center gap-3'>
                    <span
                      className={`text-xs font-semibold w-20 flex-shrink-0 ${bar.textColor}`}
                    >
                      {bar.label}
                    </span>
                    <div
                      className={`flex-1 ${bar.track} rounded-full h-2 overflow-hidden`}
                    >
                      <div
                        className={`${bar.color} h-full rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className='text-xs font-bold text-gray-700 w-10 text-right tabular-nums'>
                      {contributor[bar.key]}
                    </span>
                    <span className='text-[10px] text-gray-400 w-8 text-right tabular-nums'>
                      {Math.round(pct)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Stats */}
          <div>
            <h3 className='text-sm font-semibold text-gray-700 mb-3'>
              Activity
            </h3>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
              {[
                {
                  icon: <GitCommit className='w-4 h-4' />,
                  label: "Commits",
                  value: contributor.totalCommits,
                },
                {
                  icon: <GitPullRequest className='w-4 h-4' />,
                  label: "Pull Requests",
                  value: contributor.totalPRs,
                },
                {
                  icon: <Eye className='w-4 h-4' />,
                  label: "PR Reviews",
                  value: contributor.totalPRReviewsGiven,
                },
                {
                  icon: <AlertCircle className='w-4 h-4' />,
                  label: "Issues Opened",
                  value: contributor.totalIssuesOpened,
                },
                {
                  icon: <MessageSquare className='w-4 h-4' />,
                  label: "Issue Comments",
                  value: contributor.totalIssueComments,
                },
                {
                  icon: <GitCommit className='w-4 h-4' />,
                  label: "Avg Commits/PR",
                  value: contributor.avgCommitsPerPR.toFixed(1),
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className='flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100'
                >
                  <span className='text-gray-400'>{stat.icon}</span>
                  <div>
                    <p className='text-sm font-semibold text-gray-800'>
                      {stat.value}
                    </p>
                    <p className='text-[10px] text-gray-500'>{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PR Complexity */}
          <div>
            <h3 className='text-sm font-semibold text-gray-700 mb-3'>
              PR Complexity Breakdown
            </h3>
            <div className='grid grid-cols-3 gap-3'>
              {[
                {
                  label: "Small",
                  value: prs_by_complexity.small,
                  pct: smallPct,
                  color: "bg-green-500",
                  multiplier: "×1.0",
                },
                {
                  label: "Medium",
                  value: prs_by_complexity.medium,
                  pct: mediumPct,
                  color: "bg-yellow-500",
                  multiplier: "×1.3",
                },
                {
                  label: "Large",
                  value: prs_by_complexity.large,
                  pct: largePct,
                  color: "bg-red-500",
                  multiplier: "×1.7",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className='bg-gray-50 rounded-lg p-3 border border-gray-100 text-center'
                >
                  <p className='text-lg font-bold text-gray-800'>
                    {item.value}
                  </p>
                  <p className='text-xs text-gray-500'>{item.label}</p>
                  <p className='text-[10px] text-gray-400 font-mono font-semibold mb-2'>
                    {item.multiplier}
                  </p>
                  <div className='w-full bg-gray-200 rounded-full h-1.5'>
                    <div
                      className={`${item.color} h-1.5 rounded-full transition-all duration-500`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <p className='text-[10px] text-gray-400 mt-1'>{item.pct}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Score Breakdown Bars */}
          <div>
            <h3 className='text-sm font-semibold text-gray-700 mb-3'>
              Score Breakdown
            </h3>
            <div className='space-y-2'>
              {scoreItems
                .filter((s) => s.value > 0)
                .sort((a, b) => b.value - a.value)
                .map((item) => (
                  <div key={item.label} className='flex items-center gap-3'>
                    <span className='text-xs text-gray-600 w-32 flex-shrink-0 text-right'>
                      {item.label}
                    </span>
                    <div className='flex-1 bg-gray-100 rounded-full h-2'>
                      <div
                        className='bg-gradient-to-r from-mindfire-text-red to-orange-400 h-2 rounded-full transition-all duration-500'
                        style={{ width: `${(item.value / maxScore) * 100}%` }}
                      />
                    </div>
                    <span className='text-xs font-semibold text-gray-700 w-12 text-right'>
                      {item.value}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Projects */}
          {contributor.projects && contributor.projects.length > 0 && (
            <div>
              <h3 className='text-sm font-semibold text-gray-700 mb-3'>
                Projects ({contributor.projectsWorkingOn})
              </h3>
              <div className='flex flex-wrap gap-2'>
                {contributor.projects.map((project) => (
                  <span
                    key={project}
                    className='px-2.5 py-1 text-xs bg-gray-100 text-gray-700 rounded-full border border-gray-200'
                  >
                    {project}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContributorModal;
