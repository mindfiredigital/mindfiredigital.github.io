"use client";

import React from "react";
import {
  X,
  ExternalLink,
  GitPullRequest,
  GitCommit,
  Eye,
  AlertCircle,
  MessageSquare,
  Github,
  Layers,
} from "lucide-react";
import { ContributorModalProps } from "@/types";
import { MODAL_SECTION_TITLES, SCORE_BARS } from "@/constants";
import { useContributorModal } from "@/hooks";
import Image from "next/image";

// Inner component — only rendered when contributor is guaranteed non-null
function ContributorModalInner({
  contributor,
  onClose,
}: Required<ContributorModalProps>) {
  const {
    prs_by_complexity,
    smallPct,
    mediumPct,
    largePct,
    scoreItems,
    maxScore,
    badge,
    projectsWorkedOn,
  } = useContributorModal(contributor, onClose);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-black bg-opacity-50'
        onClick={onClose}
      />

      <div className='relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10'>
        {/* Header */}
        <div className='sticky top-0 bg-white z-10 px-6 pt-6 pb-4 border-b border-mf-border'>
          <button
            onClick={onClose}
            className='absolute top-4 right-4 text-mf-light-grey hover:text-mf-dark transition-colors p-1 rounded-full hover:bg-mf-bg-subtle'
          >
            <X className='w-5 h-5' />
          </button>

          <div className='flex items-center gap-4'>
            <div className='relative flex-shrink-0'>
              {/* Avatar ring — bg-mf-gradient-tr replaces inline gradient */}
              <div className='p-0.5 rounded-full bg-mf-gradient-tr'>
                <div className='p-0.5 rounded-full bg-white'>
                  <Image
                    src={contributor.avatar_url}
                    alt={contributor.username}
                    className='w-16 h-16 rounded-full object-cover'
                    loading='lazy'
                    height={20}
                    width={20}
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
                <h2 className='text-xl font-bold text-mf-dark'>
                  {contributor.username}
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border font-medium ${badge.color}`}
                >
                  {badge.label}
                </span>
              </div>
              <a
                href={contributor.html_url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1.5 mt-1.5 text-sm font-medium text-mf-light-grey hover:text-mf-red transition-colors group'
              >
                <Github className='w-4 h-4 group-hover:scale-110 transition-transform' />
                <span>View GitHub Profile</span>
                <ExternalLink className='w-3 h-3' />
              </a>
            </div>
          </div>
        </div>

        <div className='p-6 space-y-6'>
          {/* Score tiles — total score tile uses brand red tokens */}
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {[
              {
                label: "Total Score",
                value: contributor.total_score,
                color: "bg-mf-red-subtle border-mf-red-border text-mf-red",
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

          {/* Score composition bars */}
          <div>
            <h3 className='text-sm font-semibold text-mf-dark mb-3'>
              {MODAL_SECTION_TITLES.scoreComposition}
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
                    <span className='text-xs font-bold text-mf-dark w-10 text-right tabular-nums'>
                      {contributor[bar.key]}
                    </span>
                    <span className='text-[10px] text-mf-light-grey w-8 text-right tabular-nums'>
                      {Math.round(pct)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity stats */}
          <div>
            <h3 className='text-sm font-semibold text-mf-dark mb-3'>
              {MODAL_SECTION_TITLES.activity}
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
                {
                  icon: <Layers className='w-4 h-4' />,
                  label: "Projects",
                  value: projectsWorkedOn,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className='flex items-center gap-2.5 bg-mf-bg-subtle rounded-lg px-3 py-2.5 border border-mf-border'
                >
                  <span className='text-mf-light-grey'>{stat.icon}</span>
                  <div>
                    <p className='text-sm font-semibold text-mf-dark'>
                      {stat.value}
                    </p>
                    <p className='text-[10px] text-mf-light-grey'>
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PR complexity */}
          <div>
            <h3 className='text-sm font-semibold text-mf-dark mb-3'>
              {MODAL_SECTION_TITLES.prComplexity}
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
                  color: "bg-mf-red",
                  multiplier: "×1.7",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className='bg-mf-bg-subtle rounded-lg p-3 border border-mf-border text-center'
                >
                  <p className='text-lg font-bold text-mf-dark'>{item.value}</p>
                  <p className='text-xs text-mf-light-grey'>{item.label}</p>
                  <p className='text-[10px] text-mf-light-grey font-mono font-semibold mb-2'>
                    {item.multiplier}
                  </p>
                  <div className='w-full bg-mf-border rounded-full h-1.5'>
                    <div
                      className={`${item.color} h-1.5 rounded-full transition-all duration-500`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <p className='text-[10px] text-mf-light-grey mt-1'>
                    {item.pct}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Score breakdown bars — brand gradient replaces from-mindfire-text-red */}
          <div>
            <h3 className='text-sm font-semibold text-mf-dark mb-3'>
              {MODAL_SECTION_TITLES.scoreBreakdown}
            </h3>
            <div className='space-y-2'>
              {scoreItems
                .filter((s) => s.value > 0)
                .sort((a, b) => b.value - a.value)
                .map((item) => (
                  <div key={item.label} className='flex items-center gap-3'>
                    <span className='text-xs text-mf-light-grey w-36 flex-shrink-0 text-right'>
                      {item.label}
                    </span>
                    <div className='flex-1 bg-mf-border rounded-full h-2'>
                      <div
                        className='h-2 rounded-full transition-all duration-500 bg-mf-gradient'
                        style={{ width: `${(item.value / maxScore) * 100}%` }}
                      />
                    </div>
                    <span className='text-xs font-semibold text-mf-dark w-12 text-right'>
                      {item.value}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Projects */}
          {contributor.projects && contributor.projects.length > 0 && (
            <div>
              <h3 className='text-sm font-semibold text-mf-dark mb-3'>
                Projects ({contributor.projectsWorkingOn})
              </h3>
              <div className='flex flex-wrap gap-2'>
                {contributor.projects.map((project) => (
                  <span
                    key={project}
                    className='px-2.5 py-1 text-xs bg-violet-50 text-violet-700 rounded-full border border-violet-200'
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
}

// Outer wrapper — handles the null guard before rendering the inner component
const ContributorModal: React.FC<ContributorModalProps> = ({
  contributor,
  onClose,
}) => {
  if (!contributor) return null;
  return <ContributorModalInner contributor={contributor} onClose={onClose} />;
};

export default ContributorModal;
