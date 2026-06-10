"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  GitHubIssue,
  IssueFilters,
  DEFAULT_ISSUE_FILTERS,
} from "@/types";
import staticIssuesData from "@/asset/issues.json";
import IssueCard, { classifyIssue } from "./components/IssueCard";
import IssueFilterSidebar from "./components/IssueFilterSidebar";

const GITHUB_ORG = "mindfiredigital";

/* All open issues from the pre-baked JSON — no API calls in the page */
const ALL_ISSUES: GitHubIssue[] = (
  staticIssuesData.issues as GitHubIssue[]
).filter((i) => i.state === "open");

const formatFetchedAt = (iso: string) =>
  !iso
    ? null
    : new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

/* ── Empty / not-yet-populated state ─────────────────────────────── */

const EmptyState = ({ query }: { query: string }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="w-14 h-14 rounded-full bg-mf-red-subtle border border-mf-red-border flex items-center justify-center mb-4">
      <svg
        className="w-7 h-7 text-mf-red"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
    <p className="text-base font-semibold text-mf-dark">No issues found</p>
    {query ? (
      <p className="text-sm text-mf-light-grey mt-1">
        No results for &ldquo;{query}&rdquo;
      </p>
    ) : (
      <p className="text-sm text-mf-light-grey mt-1 max-w-xs">
        Run{" "}
        <code className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">
          npm run update-issues
        </code>{" "}
        to populate issue data.
      </p>
    )}
  </div>
);

/* ── Main page ────────────────────────────────────────────────────── */

export default function IssuesPage() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<IssueFilters>(DEFAULT_ISSUE_FILTERS);

  const handleFilterChange = useCallback((patch: Partial<IssueFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_ISSUE_FILTERS);
    setSearchQuery("");
  }, []);

  /* Pure client-side filter + sort over the complete static dataset */
  const filteredIssues = useMemo(() => {
    const q = searchQuery.toLowerCase();

    let result = ALL_ISSUES.filter((issue) => {
      if (filters.repos.length && !filters.repos.includes(issue.repoName))
        return false;
      if (
        filters.authors.length &&
        !filters.authors.includes(issue.user.login)
      )
        return false;
      if (filters.types.length) {
        const type = classifyIssue(issue);
        if (!filters.types.includes(type)) return false;
      }
      if (
        q &&
        !issue.title.toLowerCase().includes(q) &&
        !issue.repoName.toLowerCase().includes(q) &&
        !issue.labels.some((l) => l.name.toLowerCase().includes(q)) &&
        !issue.user.login.toLowerCase().includes(q)
      )
        return false;
      return true;
    });

    if (filters.sortBy === "oldest") {
      result = [...result].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (filters.sortBy === "most-comments") {
      result = [...result].sort((a, b) => b.comments - a.comments);
    }
    // "newest" is already the default order from the JSON (sorted by created desc)

    return result;
  }, [filters, searchQuery]);

  const activeFilterCount =
    filters.repos.length +
    filters.authors.length +
    filters.types.length +
    (filters.sortBy !== "newest" ? 1 : 0);

  const lastUpdated = formatFetchedAt(staticIssuesData.fetched_at);

  return (
    <section className="bg-mf-bg-subtle min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* ── Hero ── */}
        <div className="flex flex-col items-center pt-10 pb-8 text-center">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-mf-dark">
              Open Issues
            </h1>
            {ALL_ISSUES.length > 0 && (
              <span className="bg-gradient-to-r from-mf-red to-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full self-center">
                {ALL_ISSUES.length}
              </span>
            )}
          </div>
          <p className="text-lg text-mf-light-grey max-w-xl">
            Pick an open issue, start contributing, and help grow the Mindfire
            FOSS ecosystem.
          </p>
          {lastUpdated && (
            <p className="text-xs text-mf-light-grey mt-1.5">
              Last updated: {lastUpdated}
            </p>
          )}
        </div>

        <div className="flex gap-6 items-start">
          {/* ── Sidebar ── */}
          <aside className="lg:w-72 flex-shrink-0 lg:sticky lg:top-20 lg:self-start">
            <IssueFilterSidebar
              issues={ALL_ISSUES}
              filters={filters}
              searchQuery={searchQuery}
              isMobileOpen={isMobileFilterOpen}
              onFilterChange={handleFilterChange}
              onSearchChange={setSearchQuery}
              onReset={handleReset}
              onMobileToggle={() => setIsMobileFilterOpen((o) => !o)}
            />
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Results bar */}
            {ALL_ISSUES.length > 0 && (
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <p className="text-sm text-mf-light-grey">
                  Showing{" "}
                  <span className="font-semibold text-mf-dark">
                    {filteredIssues.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-mf-dark">
                    {ALL_ISSUES.length}
                  </span>{" "}
                  {ALL_ISSUES.length === 1 ? "issue" : "issues"}
                  {activeFilterCount > 0 && (
                    <span className="ml-1 text-mf-red">
                      · {activeFilterCount} filter
                      {activeFilterCount !== 1 ? "s" : ""} active
                    </span>
                  )}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="text-xs text-mf-red hover:underline font-medium"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            )}

            {/* Issue list */}
            {filteredIssues.length === 0 ? (
              <EmptyState query={searchQuery} />
            ) : (
              <div className="space-y-3">
                {filteredIssues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            )}

            {/* CTA */}
            {ALL_ISSUES.length > 0 && (
              <div className="mt-10 flex justify-center">
                <Link
                  href={`https://github.com/orgs/${GITHUB_ORG}/repositories`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-mf-secondary text-sm px-6 py-2.5 inline-flex items-center gap-2"
                >
                  Browse all repos on GitHub
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
