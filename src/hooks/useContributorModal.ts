import { useEffect } from "react";
import { TopScorer } from "@/types";
import { getRankBadge } from "@/app/utils";

// Accepts only a non-null contributor — null guard must be done before calling this hook
export function useContributorModal(
  contributor: TopScorer,
  onClose: () => void
) {
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
    {
      label: "Multi-Project Bonus",
      value: score_breakdown.projects_score ?? 0,
    },
  ];

  const maxScore = Math.max(...scoreItems.map((s) => s.value), 1);
  const badge = getRankBadge(contributor.rank);
  const projectsWorkedOn = contributor.projectsWorkingOn ?? 0;

  return {
    score_breakdown,
    prs_by_complexity,
    smallPct,
    mediumPct,
    largePct,
    scoreItems,
    maxScore,
    badge,
    projectsWorkedOn,
  };
}
