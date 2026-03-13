import { TabId } from "@/types";

export const TABS: { id: TabId; label: string }[] = [
  { id: "alltime", label: "All Time" },
  { id: "monthly", label: "Month" },
];

export const RANK_ROW_ACCENT = [
  "text-yellow-600 bg-yellow-50 border-yellow-200",
  "text-slate-500 bg-slate-50 border-slate-200",
  "text-orange-500 bg-orange-50 border-orange-200",
  "text-gray-400 bg-gray-50 border-gray-200",
  "text-gray-400 bg-gray-50 border-gray-200",
  "text-gray-400 bg-gray-50 border-gray-200",
  "text-gray-400 bg-gray-50 border-gray-200",
];

export const MONTH_NAMES_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const SCORE_BARS = [
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

export const INTERVAL_MS = 4000;
export const PAUSE_ON_CLICK_MS = 8000;
