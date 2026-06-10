"use client";

import { useState } from "react";
import Image from "next/image";
import { Filter, X, ChevronDown, ChevronUp, Search } from "lucide-react";
import { GitHubIssue, IssueFilters, IssueType } from "@/types";
import { classifyIssue } from "./IssueCard";

/* ── Types ────────────────────────────────────────────────────────── */

interface IssueFilterSidebarProps {
  issues: GitHubIssue[];
  filters: IssueFilters;
  searchQuery: string;
  isMobileOpen: boolean;
  onFilterChange: (patch: Partial<IssueFilters>) => void;
  onSearchChange: (q: string) => void;
  onReset: () => void;
  onMobileToggle: () => void;
}

/* ── Issue type config ────────────────────────────────────────────── */

const ISSUE_TYPES: { value: IssueType; label: string; color: string }[] = [
  { value: "bug", label: "Bug", color: "text-red-500" },
  { value: "feature", label: "Feature", color: "text-blue-500" },
  { value: "docs", label: "Documentation", color: "text-purple-500" },
  { value: "others", label: "Others", color: "text-gray-500" },
];

/* ── Collapsible section ──────────────────────────────────────────── */

function Section({
  title,
  isExpanded,
  onToggle,
  children,
}: {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 border-b border-gray-100 pb-4">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left py-1 group"
      >
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-700" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-700" />
        )}
      </button>
      {isExpanded && <div className="mt-3">{children}</div>}
    </div>
  );
}

/* ── Checkbox row ─────────────────────────────────────────────────── */

function CheckRow({
  label,
  checked,
  count,
  onChange,
  colorClass,
  prefix,
}: {
  label: string;
  checked: boolean;
  count?: number;
  onChange: () => void;
  colorClass?: string;
  prefix?: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group py-0.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-3.5 h-3.5 rounded border-gray-300 text-mf-red focus:ring-mf-red accent-[#f81f1f] flex-shrink-0"
      />
      {prefix}
      <span
        className={`text-xs flex-1 group-hover:text-gray-900 truncate ${colorClass ?? "text-gray-700"}`}
      >
        {label}
      </span>
      {count !== undefined && (
        <span className="text-[10px] text-gray-400 bg-gray-100 rounded-full px-1.5 py-0.5 flex-shrink-0">
          {count}
        </span>
      )}
    </label>
  );
}

/* ── Main sidebar ─────────────────────────────────────────────────── */

export default function IssueFilterSidebar({
  issues,
  filters,
  searchQuery,
  isMobileOpen,
  onFilterChange,
  onSearchChange,
  onReset,
  onMobileToggle,
}: IssueFilterSidebarProps) {
  const [expanded, setExpanded] = useState({
    sort: true,
    type: true,
    repo: true,
    author: true,
  });

  const toggle = (key: keyof typeof expanded) =>
    setExpanded((p) => ({ ...p, [key]: !p[key] }));

  /* Compute counts per repo */
  const repoCounts = issues.reduce<Record<string, number>>((acc, issue) => {
    acc[issue.repoName] = (acc[issue.repoName] ?? 0) + 1;
    return acc;
  }, {});
  const sortedRepos = Object.keys(repoCounts).sort();

  /* Compute counts per author */
  const authorCounts = issues.reduce<Record<string, number>>((acc, issue) => {
    acc[issue.user.login] = (acc[issue.user.login] ?? 0) + 1;
    return acc;
  }, {});
  const sortedAuthors = Object.keys(authorCounts).sort(
    (a, b) => authorCounts[b] - authorCounts[a]
  );

  /* Compute counts per type */
  const typeCounts = issues.reduce<Record<string, number>>((acc, issue) => {
    const t = classifyIssue(issue);
    acc[t] = (acc[t] ?? 0) + 1;
    return acc;
  }, {});

  /* Author avatars */
  const authorAvatars = issues.reduce<Record<string, string>>((acc, issue) => {
    if (!acc[issue.user.login]) acc[issue.user.login] = issue.user.avatar_url;
    return acc;
  }, {});

  const activeCount =
    filters.repos.length +
    filters.authors.length +
    filters.types.length +
    (filters.sortBy !== "newest" ? 1 : 0);

  const toggleRepo = (repo: string) =>
    onFilterChange({
      repos: filters.repos.includes(repo)
        ? filters.repos.filter((r) => r !== repo)
        : [...filters.repos, repo],
    });

  const toggleAuthor = (author: string) =>
    onFilterChange({
      authors: filters.authors.includes(author)
        ? filters.authors.filter((a) => a !== author)
        : [...filters.authors, author],
    });

  const toggleType = (type: IssueType) =>
    onFilterChange({
      types: filters.types.includes(type)
        ? filters.types.filter((t) => t !== type)
        : [...filters.types, type],
    });

  return (
    <>
      {/* Mobile FAB */}
      <button
        onClick={onMobileToggle}
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-mf-red text-white p-4 rounded-full shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
      >
        <Filter className="w-5 h-5" />
        {activeCount > 0 && (
          <span className="bg-white text-mf-red text-xs font-bold px-2 py-0.5 rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onMobileToggle}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          w-72 lg:w-full
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          bg-white rounded-xl shadow-sm border border-gray-200
          lg:max-h-[calc(100vh-6rem)]
          max-h-screen flex flex-col
        `}
      >
        {/* Mobile close */}
        <button
          onClick={onMobileToggle}
          className="lg:hidden absolute top-4 right-4 text-gray-400 hover:text-gray-700 z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-3 border-b border-gray-100 rounded-t-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">Filters</h3>
            {activeCount > 0 && (
              <button
                onClick={onReset}
                className="text-xs text-mf-red hover:text-red-700 flex items-center gap-1 font-medium"
              >
                <X className="w-3.5 h-3.5" />
                Clear ({activeCount})
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search issues…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-mf-red focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable filter sections */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {/* ── Sort ── */}
          <Section
            title="Sort by"
            isExpanded={expanded.sort}
            onToggle={() => toggle("sort")}
          >
            <div className="space-y-1.5">
              {(
                [
                  { value: "newest", label: "Newest first" },
                  { value: "oldest", label: "Oldest first" },
                  { value: "most-comments", label: "Most comments" },
                ] as const
              ).map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="sortBy"
                    checked={filters.sortBy === opt.value}
                    onChange={() => onFilterChange({ sortBy: opt.value })}
                    className="w-3.5 h-3.5 border-gray-300 text-mf-red focus:ring-mf-red accent-[#f81f1f]"
                  />
                  <span className="text-xs text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </Section>

          {/* ── Issue type ── */}
          <Section
            title="Issue type"
            isExpanded={expanded.type}
            onToggle={() => toggle("type")}
          >
            <div className="space-y-1.5">
              {ISSUE_TYPES.map((t) => (
                <CheckRow
                  key={t.value}
                  label={t.label}
                  checked={filters.types.includes(t.value)}
                  count={typeCounts[t.value] ?? 0}
                  colorClass={t.color}
                  onChange={() => toggleType(t.value)}
                />
              ))}
            </div>
          </Section>

          {/* ── Project / Repo ── */}
          <Section
            title="Project"
            isExpanded={expanded.repo}
            onToggle={() => toggle("repo")}
          >
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {sortedRepos.map((repo) => (
                <CheckRow
                  key={repo}
                  label={repo}
                  checked={filters.repos.includes(repo)}
                  count={repoCounts[repo]}
                  onChange={() => toggleRepo(repo)}
                />
              ))}
            </div>
          </Section>

          {/* ── Author ── */}
          <Section
            title="Reported by"
            isExpanded={expanded.author}
            onToggle={() => toggle("author")}
          >
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {sortedAuthors.map((login) => (
                <CheckRow
                  key={login}
                  label={login}
                  checked={filters.authors.includes(login)}
                  count={authorCounts[login]}
                  onChange={() => toggleAuthor(login)}
                  prefix={
                    <Image
                      src={authorAvatars[login]}
                      alt={login}
                      width={18}
                      height={18}
                      className="rounded-full flex-shrink-0"
                    />
                  }
                />
              ))}
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}
