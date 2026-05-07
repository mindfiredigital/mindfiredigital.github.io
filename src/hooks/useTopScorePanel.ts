import { useState, useRef, useCallback, useEffect } from "react";
import { TopScorer, TabId, MonthlyPayload, Manifest } from "@/types";
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

export function useTopScorersPanel(topScorers: TopScorer[]) {
  const [activeTab, setActiveTab] = useState<TabId>("alltime");
  const [mobileRestOpen, setMobileRestOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  // containerRef wraps the whole panel card
  const containerRef = useRef<HTMLDivElement>(null);
  // bodyRef is the inner scrollable body — we'll expand it before capture
  const bodyRef = useRef<HTMLDivElement>(null);

  const curKey = currentMonthKey();
  const [availableMonths, setAvailableMonths] = useState<string[]>([curKey]);
  const [selectedMonth, setSelectedMonth] = useState<string>(curKey);
  const [monthlyData, setMonthlyData] = useState<MonthlyPayload>(
    currentMonthRaw as unknown as MonthlyPayload
  );
  const [isLoadingMonth, setIsLoadingMonth] = useState(false);

  const monthCache = useRef<Record<string, MonthlyPayload>>({});

  // Quarterly state
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

  // Derived values
  const scorers: TopScorer[] =
    activeTab === "monthly"
      ? monthlyData.leaderboard
      : activeTab === "quarterly"
        ? quarterlyScorers
        : topScorers;
  const displayLabel =
    activeTab === "monthly"
      ? monthlyData.month_label ?? formatMonthKey(selectedMonth)
      : activeTab === "quarterly"
        ? formatQuarterKey(selectedQuarter)
        : PANEL_HEADER.displayLabelAllTime;
  const top10 = scorers.slice(0, 10);
  const podium3 = top10.slice(0, 3);
  const rest = top10.slice(3);
  const maxScore = top10[0]?.total_score ?? 1;

  /**
   * Temporarily remove scroll constraints from the body div so html-to-image
   * can see the full content height, then restore after capture.
   */
  const captureImage = useCallback(async (): Promise<string> => {
    const { toPng } = await import("html-to-image");
    const container = containerRef.current!;
    const body = bodyRef.current;

    const prevBodyStyle = body
      ? {
          maxHeight: body.style.maxHeight,
          height: body.style.height,
          overflow: body.style.overflow,
          flex: body.style.flex,
          minHeight: body.style.minHeight,
        }
      : null;

    if (body) {
      body.style.maxHeight = "none";
      body.style.height = "auto";
      body.style.overflow = "visible";
      body.style.flex = "none";
      body.style.minHeight = "unset";
    }

    const mobileRankList = container.querySelector<HTMLElement>(
      "[data-mobile-rank-list]"
    );
    let prevMobileStyle: string | null = null;
    if (mobileRankList) {
      prevMobileStyle = mobileRankList.style.maxHeight;
      mobileRankList.style.maxHeight = "none";
    }

    const imgEls = Array.from(
      container.querySelectorAll("img")
    ) as HTMLImageElement[];
    const originalSrcs = imgEls.map((img) => img.src);
    await Promise.all(
      imgEls.map(async (img) => {
        try {
          img.src = await toBase64Url(img.src);
        } catch (e) {
          return void e;
        }
      })
    );

    const actionBtns = Array.from(
      container.querySelectorAll("[data-action-btn]")
    ) as HTMLElement[];
    actionBtns.forEach((btn) => (btn.style.visibility = "hidden"));

    const dataUrl = await toPng(container, {
      cacheBust: true,
      pixelRatio: 2,
      width: container.offsetWidth,
      height: container.scrollHeight,
    });

    actionBtns.forEach((btn) => (btn.style.visibility = "visible"));
    imgEls.forEach((img, i) => (img.src = originalSrcs[i]));

    if (body && prevBodyStyle) {
      body.style.maxHeight = prevBodyStyle.maxHeight;
      body.style.height = prevBodyStyle.height;
      body.style.overflow = prevBodyStyle.overflow;
      body.style.flex = prevBodyStyle.flex;
      body.style.minHeight = prevBodyStyle.minHeight;
    }

    if (mobileRankList && prevMobileStyle !== null) {
      mobileRankList.style.maxHeight = prevMobileStyle;
    }

    return dataUrl;
  }, []);

  const getFileName = useCallback(
    () =>
      `${PANEL_HEADER.fileNamePrefix}${displayLabel
        .toLowerCase()
        .replace(/\s+/g, "-")}.png`,
    [displayLabel]
  );

  const handleDownload = useCallback(async () => {
    if (!containerRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await captureImage();
      const link = document.createElement("a");
      link.download = getFileName();
      link.href = dataUrl;
      link.click();
    } catch (err) {
      return void err;
    } finally {
      setIsDownloading(false);
    }
  }, [captureImage, getFileName]);

  const handleCopy = useCallback(async () => {
    if (!containerRef.current) return;
    setIsCopying(true);
    try {
      const dataUrl = await captureImage();
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
  }, [captureImage]);

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
    // download/copy state
    isDownloading,
    isCopying,
    copied,
    handleDownload,
    handleCopy,
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
    // derived
    displayLabel,
    top10,
    podium3,
    rest,
    maxScore,
  };
}
