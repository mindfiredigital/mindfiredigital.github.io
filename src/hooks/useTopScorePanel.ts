import { useState, useRef, useCallback, useEffect } from "react";
import { TopScorer, TabId, MonthlyPayload, Manifest } from "@/types";
import { loadScoringBundle, computeRangeLeaderboard } from "@/app/utils/rangeScoring";
import currentMonthRaw from "@/asset/leaderboard-monthly.json";
import {
  toBase64Url,
  formatMonthKey,
  currentMonthKey,
  currentQuarterKey,
  quarterMonths,
  formatQuarterKey,
  availableQuartersFromMonths,
} from "@/app/utils";
import { PANEL_HEADER, COPIED_RESET_MS } from "@/constants";

export type CaptureLayout = "vertical" | "horizontal";

// ---------------------------------------------------------------------------
// Shared card-builder helpers (pure functions, no React)
// ---------------------------------------------------------------------------

const PODIUM_SLOT_CONFIGS = [
  {
    rankIndex: 1,
    podiumHeight: 56,
    gradientFrom: "#cbd5e1",
    gradientTo: "#94a3b8",
    ringFrom: "#cbd5e1",
    ringTo: "#94a3b8",
    glowColor: "rgba(148,163,184,0.55)",
    crownFilter:
      "grayscale(0.6) brightness(1.3) drop-shadow(0 2px 6px rgba(148,163,184,0.9))",
    crownSize: "18px",
    avatarSize: 56,
    nameSz: "11px",
    scoreSz: "10px",
    scoreColor: "#64748b",
    podiumNum: "2",
    badgeBg: "#94a3b8",
    selfEnd: true,
  },
  {
    rankIndex: 0,
    podiumHeight: 96,
    gradientFrom: "#fbbf24",
    gradientTo: "#f59e0b",
    ringFrom: "#fde68a",
    ringTo: "#f59e0b",
    glowColor: "rgba(251,191,36,0.65)",
    crownFilter: "drop-shadow(0 2px 8px rgba(251,191,36,0.9))",
    crownSize: "20px",
    avatarSize: 68,
    nameSz: "12px",
    scoreSz: "10px",
    scoreColor: "#d97706",
    podiumNum: "1",
    badgeBg: "#fbbf24",
    selfEnd: false,
  },
  {
    rankIndex: 2,
    podiumHeight: 36,
    gradientFrom: "#fdba74",
    gradientTo: "#f97316",
    ringFrom: "#fdba74",
    ringTo: "#f97316",
    glowColor: "rgba(249,115,22,0.45)",
    crownFilter:
      "sepia(0.8) saturate(1.2) brightness(0.85) drop-shadow(0 2px 6px rgba(180,90,20,0.8))",
    crownSize: "16px",
    avatarSize: 48,
    nameSz: "10px",
    scoreSz: "9px",
    scoreColor: "#f97316",
    podiumNum: "3",
    badgeBg: "#f97316",
    selfEnd: true,
  },
] as const;

const RANK_ACCENTS = [
  { text: "#ca8a04", bg: "#fefce8", border: "#fde68a" },
  { text: "#64748b", bg: "#f8fafc", border: "#e2e8f0" },
  { text: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
  { text: "#9ca3af", bg: "#f9fafb", border: "#e5e7eb" },
  { text: "#9ca3af", bg: "#f9fafb", border: "#e5e7eb" },
  { text: "#9ca3af", bg: "#f9fafb", border: "#e5e7eb" },
  { text: "#9ca3af", bg: "#f9fafb", border: "#e5e7eb" },
];

function makePodiumSlotHTML(
  slot: (typeof PODIUM_SLOT_CONFIGS)[number],
  podium: TopScorer[],
  avatarUrls: Record<string, string>
): string {
  const scorer = podium[slot.rankIndex];
  if (!scorer) return "";
  const src = avatarUrls[scorer.username] ?? scorer.avatar_url;
  const alignSelf = slot.selfEnd ? "align-self:flex-end;" : "";

  return `
    <div style="display:flex;flex-direction:column;align-items:center;${alignSelf}">
      <span style="font-size:${slot.crownSize};filter:${
        slot.crownFilter
      };margin-bottom:4px;line-height:1;display:block;">👑</span>
      <div style="position:relative;margin-bottom:4px;">
        <div style="position:absolute;inset:-4px;border-radius:50%;background:${
          slot.glowColor
        };filter:blur(10px);opacity:0.75;pointer-events:none;"></div>
        <div style="position:relative;padding:2.5px;border-radius:50%;background:linear-gradient(135deg,${
          slot.ringFrom
        },${slot.ringTo});">
          <div style="padding:2px;border-radius:50%;background:white;">
            <img src="${src}" width="${slot.avatarSize}" height="${
              slot.avatarSize
            }"
              style="border-radius:50%;object-fit:cover;display:block;width:${
                slot.avatarSize
              }px;height:${slot.avatarSize}px;" />
          </div>
        </div>
        <span style="position:absolute;bottom:-4px;right:-4px;width:22px;height:22px;border-radius:50%;
          background:${
            slot.badgeBg
          };border:2px solid white;display:flex;align-items:center;
          justify-content:center;font-size:10px;font-weight:900;color:white;
          box-shadow:0 2px 6px rgba(0,0,0,0.2);">${slot.podiumNum}</span>
      </div>
      <p style="font-size:${
        slot.nameSz
      };font-weight:700;color:#1f2937;max-width:72px;overflow:hidden;
        white-space:nowrap;text-overflow:ellipsis;text-align:center;margin:8px 0 0;">${
          scorer.username
        }</p>
      <p style="font-size:${slot.scoreSz};font-weight:600;color:${
        slot.scoreColor
      };margin:2px 0 8px;
        font-variant-numeric:tabular-nums;">${scorer.total_score.toLocaleString()} pts</p>
      <div style="width:72px;height:${
        slot.podiumHeight
      }px;border-radius:12px 12px 0 0;
        background:linear-gradient(to bottom,${slot.gradientFrom},${
          slot.gradientTo
        });
        position:relative;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
        <div style="position:absolute;top:0;left:10px;width:8px;height:100%;background:rgba(255,255,255,0.25);
          border-radius:4px;transform:skewX(-6deg);"></div>
        <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;">
          <span style="color:rgba(255,255,255,0.7);font-weight:900;font-size:20px;line-height:1;
            user-select:none;">${slot.podiumNum}</span>
        </div>
      </div>
    </div>`;
}

function makeRankRowHTML(
  scorer: TopScorer,
  rank: number,
  idx: number,
  maxScore: number,
  avatarUrls: Record<string, string>
): string {
  const pct = Math.round((scorer.total_score / maxScore) * 100);
  const accent = RANK_ACCENTS[Math.min(idx, RANK_ACCENTS.length - 1)];
  const src = avatarUrls[scorer.username] ?? scorer.avatar_url;
  return `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:12px;
      background:white;border:1px solid #f3f4f6;box-sizing:border-box;">
      <span style="flex-shrink:0;width:22px;height:22px;border-radius:6px;border:1px solid ${
        accent.border
      };
        background:${accent.bg};color:${
          accent.text
        };font-size:10px;font-weight:900;
        display:flex;align-items:center;justify-content:center;">${rank}</span>
      <img src="${src}" width="28" height="28"
        style="border-radius:50%;object-fit:cover;flex-shrink:0;width:28px;height:28px;display:block;" />
      <div style="flex:1;min-width:0;">
        <p style="font-size:11px;font-weight:700;color:#111827;overflow:hidden;white-space:nowrap;
          text-overflow:ellipsis;line-height:1;margin:0 0 4px;">${
            scorer.username
          }</p>
        <div style="height:4px;width:100%;background:#e5e7eb;border-radius:9999px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:linear-gradient(to right,#ef4444,#dc2626);
            border-radius:9999px;"></div>
        </div>
      </div>
      <span style="flex-shrink:0;font-size:11px;font-weight:700;color:#9ca3af;
        font-variant-numeric:tabular-nums;">${scorer.total_score.toLocaleString()}</span>
    </div>`;
}

/** Clean card header: only trophy, title, contributor count + period label */
function makeCardHeader(count: number, label: string): string {
  return `
    <div style="position:relative;padding:16px 20px 14px;border-bottom:1px solid #f3f4f6;
      background:radial-gradient(ellipse at 50% -30%,rgba(251,191,36,0.15) 0%,transparent 65%);">
      <div style="display:flex;align-items:center;gap:12px;">
        <span style="font-size:28px;filter:drop-shadow(0 2px 10px rgba(251,191,36,0.75));line-height:1;">🏆</span>
        <div>
          <h3 style="font-size:14px;font-weight:800;color:#111827;margin:0;letter-spacing:-0.3px;">Hall of Fame</h3>
          <p style="font-size:10px;color:#9ca3af;margin:2px 0 0;text-transform:uppercase;
            letter-spacing:0.1em;font-weight:600;">Top ${count} Contributors · ${label}</p>
        </div>
      </div>
    </div>`;
}

async function resolveAvatars(
  scorers: TopScorer[]
): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  await Promise.all(
    scorers.map(async (s) => {
      try {
        map[s.username] = await toBase64Url(s.avatar_url);
      } catch {
        map[s.username] = s.avatar_url;
      }
    })
  );
  return map;
}

async function mountOffscreen(html: string): Promise<HTMLElement> {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "position:fixed;top:-9999px;left:-9999px;z-index:-1;";
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);
  const imgs = Array.from(
    wrapper.querySelectorAll("img")
  ) as HTMLImageElement[];
  await Promise.all(
    imgs.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }
          img.onload = () => resolve();
          img.onerror = () => resolve();
        })
    )
  );
  return wrapper;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useTopScorersPanel(topScorers: TopScorer[]) {
  const [activeTab, setActiveTab] = useState<TabId>("alltime");
  const [mobileRestOpen, setMobileRestOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  // Which button's popover is open: "download" | "copy" | null
  const [actionPopover, setActionPopover] = useState<
    "download" | "copy" | null
  >(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const curKey = currentMonthKey();
  const [availableMonths, setAvailableMonths] = useState<string[]>([curKey]);
  const [selectedMonth, setSelectedMonth] = useState<string>(curKey);
  const [monthlyData, setMonthlyData] = useState<MonthlyPayload>(
    currentMonthRaw as unknown as MonthlyPayload
  );
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);
  const monthCache = useRef<Record<string, MonthlyPayload>>({});

  const curQuarter = currentQuarterKey();
  const [selectedQuarter, setSelectedQuarter] = useState<string>(curQuarter);
  const [availableQuarters, setAvailableQuarters] = useState<string[]>([
    curQuarter,
  ]);
  const [quarterlyScorers, setQuarterlyScorers] = useState<TopScorer[]>([]);
  const [isLoadingQuarter, setIsLoadingQuarter] = useState(false);
  const quarterCache = useRef<Record<string, TopScorer[]>>({});

  useEffect(() => {
    if (activeTab !== "monthly" && activeTab !== "quarterly") return;
    fetch("/leaderboard/manifest.json")
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then((m: Manifest) => {
        if (m.months?.length) {
          const months = m.months.includes(curKey)
            ? m.months
            : [curKey, ...m.months];
          setAvailableMonths(months);
          setAvailableQuarters(availableQuartersFromMonths(months));
        }
      })
      .catch(() => {
        setAvailableMonths([curKey]);
        setAvailableQuarters([curQuarter]);
      });
  }, [activeTab]);

  const loadMonth = useCallback(
    async (key: string) => {
      const isPastMonth = key !== curKey;
      if (isPastMonth && monthCache.current[key]) {
        setMonthlyData(monthCache.current[key]);
        return;
      }
      setIsLoadingMonth(true);
      try {
        const res = await fetch(`/leaderboard/leaderboard-${key}.json`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: MonthlyPayload = await res.json();
        if (isPastMonth) monthCache.current[key] = data;
        setMonthlyData(data);
      } catch {
        if (key === curKey)
          setMonthlyData(currentMonthRaw as unknown as MonthlyPayload);
      } finally {
        setIsLoadingMonth(false);
      }
    },
    [curKey]
  );

  useEffect(() => {
    if (activeTab !== "monthly") return;
    loadMonth(selectedMonth);
  }, [selectedMonth, activeTab, loadMonth]);

  const loadQuarter = useCallback(async (key: string) => {
    if (quarterCache.current[key]) {
      setQuarterlyScorers(quarterCache.current[key]);
      return;
    }
    setIsLoadingQuarter(true);
    try {
      const months = quarterMonths(key);
      const results = await Promise.allSettled(
        months.map((m) =>
          fetch(`/leaderboard/leaderboard-${m}.json`).then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json() as Promise<MonthlyPayload>;
          })
        )
      );
      const scoreMap = new Map<string, TopScorer>();
      for (const result of results) {
        if (result.status !== "fulfilled") continue;
        for (const scorer of result.value.leaderboard) {
          const existing = scoreMap.get(scorer.username);
          if (existing) {
            existing.total_score += scorer.total_score;
            existing.code_score += scorer.code_score;
            existing.quality_score += scorer.quality_score;
            existing.community_score += scorer.community_score;
            existing.totalCommits += scorer.totalCommits;
            existing.totalPRs += scorer.totalPRs;
            existing.totalPRReviewsGiven += scorer.totalPRReviewsGiven;
            existing.totalCodeReviewComments += scorer.totalCodeReviewComments;
            existing.totalIssuesOpened += scorer.totalIssuesOpened;
            existing.totalIssueComments += scorer.totalIssueComments;
            existing.projectsWorkingOn = Math.max(
              existing.projectsWorkingOn,
              scorer.projectsWorkingOn
            );
          } else {
            scoreMap.set(scorer.username, { ...scorer });
          }
        }
      }
      const aggregated = Array.from(scoreMap.values())
        .sort((a, b) => b.total_score - a.total_score)
        .map((s, i) => ({ ...s, rank: i + 1 }));
      quarterCache.current[key] = aggregated;
      setQuarterlyScorers(aggregated);
    } catch {
      setQuarterlyScorers([]);
    } finally {
      setIsLoadingQuarter(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab !== "quarterly") return;
    loadQuarter(selectedQuarter);
  }, [selectedQuarter, activeTab, loadQuarter]);

  // ── Custom date-range ───────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const defaultFrom = `${today.slice(0, 4)}-01-01`; // Jan 1 of current year
  const [customFrom, setCustomFrom] = useState<string>(defaultFrom);
  const [customTo, setCustomTo] = useState<string>(today);
  const [customScorers, setCustomScorers] = useState<TopScorer[]>([]);
  const [isLoadingCustom, setIsLoadingCustom] = useState(false);

  const computeCustomRange = useCallback(async (from: string, to: string) => {
    if (!from || !to || from > to) return;
    setIsLoadingCustom(true);
    try {
      const bundle = await loadScoringBundle();
      const results = computeRangeLeaderboard(bundle, from, to);
      setCustomScorers(results);
    } catch {
      setCustomScorers([]);
    } finally {
      setIsLoadingCustom(false);
    }
  }, []);

  // Trigger computation when the custom tab is active and dates change
  useEffect(() => {
    if (activeTab !== "custom") return;
    computeCustomRange(customFrom, customTo);
  }, [activeTab, customFrom, customTo, computeCustomRange]);

  // Derived
  const scorers: TopScorer[] =
    activeTab === "monthly"
      ? monthlyData.leaderboard
      : activeTab === "quarterly"
        ? quarterlyScorers
        : activeTab === "custom"
          ? customScorers
          : topScorers;
  const displayLabel =
    activeTab === "monthly"
      ? monthlyData.month_label ?? formatMonthKey(selectedMonth)
      : activeTab === "quarterly"
        ? formatQuarterKey(selectedQuarter)
        : activeTab === "custom"
          ? `${customFrom} → ${customTo}`
          : PANEL_HEADER.displayLabelAllTime;
  const top10 = scorers.slice(0, 10);
  const podium3 = top10.slice(0, 3);
  const rest = top10.slice(3);
  const maxScore = top10[0]?.total_score ?? 1;

  // ---------------------------------------------------------------------------
  // Image builders
  // ---------------------------------------------------------------------------

  const buildVerticalCard = useCallback(
    async (sl: TopScorer[], label: string): Promise<HTMLElement> => {
      const max = sl[0]?.total_score ?? 1;
      const podium = sl.slice(0, 3);
      const rankList = sl.slice(3, 10);
      const avatarUrls = await resolveAvatars(sl);

      const podiumHTML = PODIUM_SLOT_CONFIGS.map((slot) =>
        makePodiumSlotHTML(slot, podium, avatarUrls)
      ).join("");
      const rankRowsHTML = rankList
        .map((s, i) => makeRankRowHTML(s, i + 4, i, max, avatarUrls))
        .join("");

      return mountOffscreen(`
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          background:white;border-radius:20px;border:1px solid #f3f4f6;
          box-shadow:0 10px 40px rgba(0,0,0,0.12);overflow:hidden;width:320px;">
          ${makeCardHeader(sl.length, label)}
          <div style="position:relative;padding:16px 16px 4px;
            background:radial-gradient(ellipse at 50% 100%,rgba(251,191,36,0.08) 0%,transparent 70%);">
            <div style="display:flex;align-items:flex-end;justify-content:center;gap:8px;">
              ${podiumHTML}
            </div>
            <div style="height:2px;margin-top:4px;border-radius:9999px;
              background:linear-gradient(to right,transparent,#e5e7eb,transparent);"></div>
          </div>
          <div style="padding:8px 12px 12px;display:flex;flex-direction:column;gap:6px;">
            ${rankRowsHTML}
          </div>
        </div>`);
    },
    []
  );

  const buildHorizontalCard = useCallback(
    async (sl: TopScorer[], label: string): Promise<HTMLElement> => {
      const max = sl[0]?.total_score ?? 1;
      const podium = sl.slice(0, 3);
      const rankList = sl.slice(3, 10);
      const avatarUrls = await resolveAvatars(sl);

      const podiumHTML = PODIUM_SLOT_CONFIGS.map((slot) =>
        makePodiumSlotHTML(slot, podium, avatarUrls)
      ).join("");
      const rankRowsHTML = rankList
        .map((s, i) => makeRankRowHTML(s, i + 4, i, max, avatarUrls))
        .join("");

      return mountOffscreen(`
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          background:white;border-radius:20px;border:1px solid #f3f4f6;
          box-shadow:0 10px 40px rgba(0,0,0,0.12);overflow:hidden;width:680px;">
          ${makeCardHeader(sl.length, label)}
          <div style="display:flex;align-items:stretch;min-height:300px;">
            <div style="flex:0 0 260px;padding:20px 16px 16px;display:flex;flex-direction:column;
              border-right:1px solid #f3f4f6;
              background:radial-gradient(ellipse at 50% 100%,rgba(251,191,36,0.08) 0%,transparent 70%);">
              <p style="font-size:9px;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;
                color:#d1d5db;text-align:center;margin:0 0 12px;">🥇 Top 3</p>
              <div style="display:flex;align-items:flex-end;justify-content:center;gap:8px;flex:1;">
                ${podiumHTML}
              </div>
              <div style="height:2px;margin-top:8px;border-radius:9999px;
                background:linear-gradient(to right,transparent,#e5e7eb,transparent);"></div>
            </div>
            <div style="flex:1;padding:16px 14px;display:flex;flex-direction:column;gap:6px;justify-content:center;">
              <p style="font-size:9px;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;
                color:#d1d5db;margin:0 0 4px;">Ranks 4–${Math.min(
                  10,
                  rankList.length + 3
                )}</p>
              ${rankRowsHTML}
            </div>
          </div>
        </div>`);
    },
    []
  );

  // ---------------------------------------------------------------------------
  // Core capture
  // ---------------------------------------------------------------------------

  const capture = useCallback(
    async (layout: CaptureLayout): Promise<string> => {
      const { toPng } = await import("html-to-image");
      const sl = (
        activeTab === "monthly"
          ? monthlyData.leaderboard
          : activeTab === "quarterly"
            ? quarterlyScorers
            : topScorers
      ).slice(0, 10);

      const wrapper =
        layout === "horizontal"
          ? await buildHorizontalCard(sl, displayLabel)
          : await buildVerticalCard(sl, displayLabel);

      const card = wrapper.firstElementChild as HTMLElement;
      const dataUrl = await toPng(card, {
        cacheBust: true,
        pixelRatio: 2,
        width: card.offsetWidth,
        height: card.offsetHeight,
      });
      document.body.removeChild(wrapper);
      return dataUrl;
    },
    [
      activeTab,
      monthlyData,
      quarterlyScorers,
      topScorers,
      displayLabel,
      buildVerticalCard,
      buildHorizontalCard,
    ]
  );

  const getFileName = useCallback(
    (layout: CaptureLayout) =>
      `${PANEL_HEADER.fileNamePrefix}-${layout}-${displayLabel
        .toLowerCase()
        .replace(/\s+/g, "-")}.png`,
    [displayLabel]
  );

  // ---------------------------------------------------------------------------
  // Public handlers — invoked from popover option buttons
  // ---------------------------------------------------------------------------

  const handleDownloadLayout = useCallback(
    async (layout: CaptureLayout) => {
      setActionPopover(null);
      setIsDownloading(true);
      try {
        const dataUrl = await capture(layout);
        const link = document.createElement("a");
        link.download = getFileName(layout);
        link.href = dataUrl;
        link.click();
      } catch (err) {
        return void err;
      } finally {
        setIsDownloading(false);
      }
    },
    [capture, getFileName]
  );

  const handleCopyLayout = useCallback(
    async (layout: CaptureLayout) => {
      setActionPopover(null);
      setIsCopying(true);
      try {
        const dataUrl = await capture(layout);
        const blob = await (await fetch(dataUrl)).blob();
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), COPIED_RESET_MS);
      } catch (err) {
        return void err;
      } finally {
        setIsCopying(false);
      }
    },
    [capture]
  );

  return {
    // refs
    containerRef,
    bodyRef,
    // tab
    activeTab,
    setActiveTab,
    // mobile accordion
    mobileRestOpen,
    setMobileRestOpen,
    // action state
    isDownloading,
    isCopying,
    copied,
    // popover
    actionPopover,
    setActionPopover,
    // layout handlers
    handleDownloadLayout,
    handleCopyLayout,
    // monthly
    curKey,
    availableMonths,
    selectedMonth,
    setSelectedMonth,
    isLoadingMonth,
    // quarterly
    curQuarter,
    availableQuarters,
    selectedQuarter,
    setSelectedQuarter,
    isLoadingQuarter,
    // custom range
    customFrom,
    customTo,
    isLoadingCustom,
    setCustomFrom,
    setCustomTo,
    // derived
    displayLabel,
    top10,
    podium3,
    rest,
    maxScore,
  };
}
