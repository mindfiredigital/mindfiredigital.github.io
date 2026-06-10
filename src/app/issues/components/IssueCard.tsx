import Link from "next/link";
import Image from "next/image";
import { GitHubIssue, IssueType } from "@/types";

/* ── helpers ──────────────────────────────────────────────────────── */

export function classifyIssue(issue: GitHubIssue): IssueType {
  const names = issue.labels.map((l) => l.name.toLowerCase());
  if (names.some((n) => /bug|defect|error|crash|broken|fix/.test(n)))
    return "bug";
  if (
    names.some((n) =>
      /feature|enhancement|request|improvement|new/.test(n)
    )
  )
    return "feature";
  if (names.some((n) => /doc|documentation/.test(n))) return "docs";
  return "others";
}

const TYPE_CONFIG: Record<
  IssueType,
  { label: string; bg: string; text: string; dot: string }
> = {
  bug: {
    label: "Bug",
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
  },
  feature: {
    label: "Feature",
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-500",
  },
  docs: {
    label: "Docs",
    bg: "bg-purple-50",
    text: "text-purple-600",
    dot: "bg-purple-500",
  },
  others: {
    label: "Others",
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
  },
};

function getLabelStyle(hex: string) {
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return {
    background: `rgba(${r},${g},${b},0.13)`,
    border: `1px solid rgba(${r},${g},${b},0.4)`,
    color: `#${hex}`,
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ── component ────────────────────────────────────────────────────── */

interface IssueCardProps {
  issue: GitHubIssue;
}

export default function IssueCard({ issue }: IssueCardProps) {
  const type = classifyIssue(issue);
  const cfg = TYPE_CONFIG[type];

  return (
    <article className="bg-white border border-mf-border rounded-xl p-5 flex gap-4 hover:shadow-[var(--mf-shadow-card-hover)] transition-all duration-200 group">
      {/* Author avatar */}
      <Link
        href={issue.user.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 mt-0.5"
      >
        <Image
          src={issue.user.avatar_url}
          alt={issue.user.login}
          width={38}
          height={38}
          className="rounded-full border border-mf-border"
        />
      </Link>

      {/* Body */}
      <div className="flex-1 min-w-0">
        {/* Top row: repo badge · type badge · issue number */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-mf-red border border-mf-red-border bg-mf-red-subtle rounded-full px-2.5 py-0.5">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
              />
            </svg>
            {issue.repoName}
          </span>

          <span
            className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-2.5 py-0.5 ${cfg.bg} ${cfg.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>

          <span className="text-xs text-mf-light-grey font-mono">
            #{issue.number}
          </span>
        </div>

        {/* Title */}
        <Link
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm sm:text-base font-semibold text-mf-dark group-hover:text-mf-red transition-colors duration-150 line-clamp-2"
        >
          {issue.title}
        </Link>

        {/* GitHub labels */}
        {issue.labels.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {issue.labels.map((label) => (
              <span
                key={label.id}
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={getLabelStyle(label.color)}
                title={label.description ?? label.name}
              >
                {label.name}
              </span>
            ))}
          </div>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs text-mf-light-grey">
          <span>
            by{" "}
            <Link
              href={issue.user.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-mf-dark hover:text-mf-red transition-colors"
            >
              {issue.user.login}
            </Link>
          </span>
          <span>·</span>
          <span>{formatDate(issue.created_at)}</span>
          {issue.comments > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                {issue.comments}
              </span>
            </>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="flex-shrink-0 self-center hidden sm:block">
        <Link
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-mf-red hover:opacity-90 active:scale-[0.98] transition-all duration-150 rounded-full px-4 py-2 whitespace-nowrap"
        >
          Contribute
          <svg
            className="w-3.5 h-3.5"
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
    </article>
  );
}
