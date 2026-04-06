import { useState, useMemo } from "react";
import { Contributor, ContributorFilters, TopScorer } from "@/types";
import { CONTRIBUTORS_FILTERS_DEFAULT } from "@/constants";

export function useContributorFilters(
  contributorsArray: Contributor[],
  topScorers: TopScorer[]
) {
  const [filters, setFilters] = useState<ContributorFilters>(
    CONTRIBUTORS_FILTERS_DEFAULT
  );
  const [searchQuery, setSearchQuery] = useState("");

  const getLastActiveDays = (username: string): number | null => {
    const match = contributorsArray.find(
      (c) => c.login.toLowerCase() === username.toLowerCase()
    );
    return match?.lastActiveDays ?? null;
  };

  const handleFilterChange = (partial: Partial<ContributorFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleReset = () => {
    setFilters({ ...CONTRIBUTORS_FILTERS_DEFAULT });
    setSearchQuery("");
  };

  /*
   * filteredAndSorted — derived from topScorers on every filter/search change.
   * Applies search → activity filter → score range → sort in that order.
   */
  const filteredAndSorted = useMemo(() => {
    let result = [...topScorers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.username.toLowerCase().includes(q));
    }
    if (filters.activityFilter !== "all") {
      const maxDays = parseInt(filters.activityFilter, 10);
      result = result.filter((c) => {
        const days = getLastActiveDays(c.username);
        return days !== null && days <= maxDays;
      });
    }
    if (filters.scoreRange !== "all") {
      const min = parseInt(filters.scoreRange.replace("+", ""), 10);
      if (!isNaN(min)) result = result.filter((c) => c.total_score >= min);
    }
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "code_score":
          return b.code_score - a.code_score;
        case "quality_score":
          return b.quality_score - a.quality_score;
        case "community_score":
          return b.community_score - a.community_score;
        case "totalCommits":
          return b.totalCommits - a.totalCommits;
        case "totalPRs":
          return b.totalPRs - a.totalPRs;
        case "totalPRReviewsGiven":
          return b.totalPRReviewsGiven - a.totalPRReviewsGiven;
        case "totalIssuesOpened":
          return b.totalIssuesOpened - a.totalIssuesOpened;
        case "total_score":
        default:
          return b.total_score - a.total_score;
      }
    });
    return result;
  }, [topScorers, filters, searchQuery]);

  return {
    filters,
    searchQuery,
    filteredAndSorted,
    handleFilterChange,
    handleSearchChange,
    handleReset,
  };
}
