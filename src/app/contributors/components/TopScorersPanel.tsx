"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  TopScorer,
  TopScorersPanelProps,
  TabId,
  MonthlyPayload,
  Manifest,
} from "@/types";
import currentMonthRaw from "@/asset/leaderboard-monthly.json";
import { toBase64Url, formatMonthKey, currentMonthKey } from "@/app/utils";
import { PANEL_HEADER, COPIED_RESET_MS } from "@/constants";
import PanelHeader from "./Panelheader";
import PanelBody from "./Panelbody";

export default function TopScorersPanel({
  topScorers,
  onViewDetails,
}: TopScorersPanelProps) {
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

  useEffect(() => {
    if (activeTab !== "monthly") return;
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
        }
      })
      .catch(() => setAvailableMonths([curKey]));
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

  const scorers: TopScorer[] =
    activeTab === "monthly" ? monthlyData.leaderboard : topScorers;
  const displayLabel =
    activeTab === "monthly"
      ? monthlyData.month_label ?? formatMonthKey(selectedMonth)
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
      console.error("Failed to download image:", err);
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
      console.error("Failed to copy image:", err);
    } finally {
      setIsCopying(false);
    }
  }, [captureImage]);

  return (
    <div
      ref={containerRef}
      className='flex flex-col rounded-2xl border border-gray-100 shadow-lg bg-white overflow-hidden lg:h-full'
    >
      <PanelHeader
        activeTab={activeTab}
        top10Length={top10.length}
        isDownloading={isDownloading}
        isCopying={isCopying}
        copied={copied}
        onTabChange={setActiveTab}
        onDownload={handleDownload}
        onCopy={handleCopy}
        availableMonths={availableMonths}
        selectedMonth={selectedMonth}
        curKey={curKey}
        isLoadingMonth={isLoadingMonth}
        displayLabel={displayLabel}
        onMonthSelect={setSelectedMonth}
      />

      <PanelBody
        bodyRef={bodyRef}
        isLoadingMonth={isLoadingMonth}
        selectedMonth={selectedMonth}
        top10={top10}
        podium3={podium3}
        rest={rest}
        maxScore={maxScore}
        displayLabel={displayLabel}
        mobileRestOpen={mobileRestOpen}
        onMobileToggle={() => setMobileRestOpen((v) => !v)}
        onViewDetails={onViewDetails}
      />

      {/* Footer */}
      <div className='px-5 py-2.5 border-t border-gray-100 bg-gray-50/60 flex-shrink-0'>
        <p className='text-[10px] text-center text-gray-400 font-medium uppercase tracking-wider'>
          {PANEL_HEADER.footerHint}
        </p>
      </div>

      <style>{`
        @keyframes trophyFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}
