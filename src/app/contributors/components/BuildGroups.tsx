import { Contributor, TopScorer, DisplayContributor } from "@/types";

export function BuildGroups(
  contributors: Contributor[],
  topScorers: TopScorer[]
): { label: string; icon: string; items: DisplayContributor[] }[] {
  const activeThisWeek = [...contributors]
    .filter((c) => c.lastActiveDays !== null && c.lastActiveDays <= 7)
    .sort((a, b) => (a.lastActiveDays ?? 99) - (b.lastActiveDays ?? 99))
    .slice(0, 6)
    .map((c) => ({
      login: c.login,
      avatar_url: c.avatar_url,
      html_url: c.html_url,
      stat:
        c.lastActiveDays === 0
          ? "Active today"
          : c.lastActiveDays === 1
            ? "Active yesterday"
            : `Active ${c.lastActiveDays}d ago`,
    }));

  const activeThisMonth = [...contributors]
    .filter((c) => c.lastActiveDays !== null && c.lastActiveDays <= 30)
    .sort((a, b) => (a.lastActiveDays ?? 99) - (b.lastActiveDays ?? 99))
    .slice(0, 6)
    .map((c) => ({
      login: c.login,
      avatar_url: c.avatar_url,
      html_url: c.html_url,
      stat: `Active ${c.lastActiveDays}d ago`,
    }));

  const topByPRs = [...topScorers]
    .sort((a, b) => b.totalPRs - a.totalPRs)
    .slice(0, 6)
    .map((s) => ({
      login: s.username,
      avatar_url: s.avatar_url,
      html_url: s.html_url,
      stat: `${s.totalPRs} PRs`,
    }));

  const topByCommits = [...topScorers]
    .sort((a, b) => b.totalCommits - a.totalCommits)
    .slice(0, 6)
    .map((s) => ({
      login: s.username,
      avatar_url: s.avatar_url,
      html_url: s.html_url,
      stat: `${s.totalCommits} commits`,
    }));

  return [
    {
      label: "Active This Week",
      icon: "",
      items:
        activeThisWeek.length > 0
          ? activeThisWeek
          : activeThisMonth.slice(0, 6),
    },
    {
      label: "Most PRs Raised",
      icon: "",
      items: topByPRs,
    },
    {
      label: "Top by Commits",
      icon: "",
      items: topByCommits,
    },
  ];
}
