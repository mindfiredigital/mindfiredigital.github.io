import { TabId } from "@/types";

export const TABS: { id: TabId; label: string }[] = [
  { id: "alltime", label: "All Time" },
  { id: "monthly", label: "Month" },
];

export const PODIUM_SLOTS = [
  {
    rankIndex: 1,
    podiumHeight: "h-14",
    podiumGradient: "from-slate-300 to-slate-400",
    ringFrom: "#cbd5e1",
    ringTo: "#94a3b8",
    glowColor: "rgba(148,163,184,0.55)",
    crownFilter:
      "grayscale(0.6) brightness(1.3) drop-shadow(0 2px 6px rgba(148,163,184,0.9))",
    crownSize: "text-lg",
    crownDuration: "2.8s",
    avatarSize: "w-14 h-14",
    nameSz: "text-[11px]",
    scoreSz: "text-[10px]",
    scoreColor: "text-slate-500",
    podiumNum: "2",
    badgeBg: "bg-slate-400",
    selfEnd: true,
  },
  {
    rankIndex: 0,
    podiumHeight: "h-24",
    podiumGradient: "from-yellow-400 to-amber-500",
    ringFrom: "#fde68a",
    ringTo: "#f59e0b",
    glowColor: "rgba(251,191,36,0.65)",
    crownFilter: "drop-shadow(0 2px 8px rgba(251,191,36,0.9))",
    crownSize: "text-xl",
    crownDuration: "2.5s",
    avatarSize: "w-[4.25rem] h-[4.25rem]",
    nameSz: "text-xs",
    scoreSz: "text-[10px]",
    scoreColor: "text-yellow-600",
    podiumNum: "1",
    badgeBg: "bg-yellow-400",
    selfEnd: false,
  },
  {
    rankIndex: 2,
    podiumHeight: "h-9",
    podiumGradient: "from-orange-300 to-amber-400",
    ringFrom: "#fdba74",
    ringTo: "#f97316",
    glowColor: "rgba(249,115,22,0.45)",
    crownFilter:
      "sepia(0.8) saturate(1.2) brightness(0.85) drop-shadow(0 2px 6px rgba(180,90,20,0.8))",
    crownSize: "text-base",
    crownDuration: "3.1s",
    avatarSize: "w-12 h-12",
    nameSz: "text-[10px]",
    scoreSz: "text-[9px]",
    scoreColor: "text-orange-500",
    podiumNum: "3",
    badgeBg: "bg-orange-400",
    selfEnd: true,
  },
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
