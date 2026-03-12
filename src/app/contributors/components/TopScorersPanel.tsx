"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  TopScorer,
  TopScorersPanelProps,
  TabId,
  MonthlyPayload,
  Manifest,
} from "@/types";
import currentMonthRaw from "../../projects/assets/leaderboard-monthly.json";
import { TABS, PODIUM_SLOTS, RANK_ROW_ACCENT } from "@/constants";

import { toBase64Url, formatMonthKey, currentMonthKey } from "@/app/utils";
import { MonthCalendarPicker } from "./MonthCalendarPicker";

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
      : "All Time";
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

    // --- 1. Expand the body so all content is visible ---
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

    // Also expand the ranks 4-10 on mobile (collapsed accordion) so they appear
    const mobileRankList = container.querySelector<HTMLElement>(
      "[data-mobile-rank-list]"
    );
    let prevMobileStyle: string | null = null;
    if (mobileRankList) {
      prevMobileStyle = mobileRankList.style.maxHeight;
      mobileRankList.style.maxHeight = "none";
    }

    // --- 2. Convert avatar <img> tags to base64 so cross-origin images render ---
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

    // --- 3. Hide action buttons (download/copy/calendar picker) ---
    const actionBtns = Array.from(
      container.querySelectorAll("[data-action-btn]")
    ) as HTMLElement[];
    actionBtns.forEach((btn) => (btn.style.visibility = "hidden"));

    // --- 4. Capture ---
    const dataUrl = await toPng(container, {
      cacheBust: true,
      pixelRatio: 2,
      // Explicitly set dimensions to full scroll size
      width: container.offsetWidth,
      height: container.scrollHeight,
    });

    // --- 5. Restore everything ---
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
    () => `hall-of-fame-${displayLabel.toLowerCase().replace(/\s+/g, "-")}.png`,
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
      setTimeout(() => setCopied(false), 2000);
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
      {/* ── Header ── */}
      <div className='relative px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0'>
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            background:
              "radial-gradient(ellipse at 50% -30%, rgba(251,191,36,0.15) 0%, transparent 65%)",
          }}
        />

        <div className='relative flex items-center gap-3 mb-3'>
          <div className='relative flex-shrink-0'>
            <div
              className='absolute inset-0 rounded-full blur-md'
              style={{ background: "rgba(251,191,36,0.35)" }}
            />
            <span
              className='relative text-[1.75rem] select-none leading-none'
              style={{
                filter: "drop-shadow(0 2px 10px rgba(251,191,36,0.75))",
                display: "inline-block",
                animation: "trophyFloat 3s ease-in-out infinite",
              }}
            >
              🏆
            </span>
          </div>
          <div>
            <h3 className='text-sm font-extrabold text-gray-900 tracking-tight leading-none'>
              Hall of Fame
            </h3>
            <p className='text-[10px] text-gray-400 mt-0.5 uppercase tracking-widest font-semibold'>
              Top {top10.length} Contributors
            </p>
          </div>
          <div className='ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 flex-shrink-0'>
            <span className='w-1.5 h-1.5 rounded-full bg-mf-red animate-pulse' />
            <span className='text-[10px] font-bold text-mf-red uppercase tracking-wide'>
              Live
            </span>
          </div>
        </div>

        <div className='relative flex items-center gap-2'>
          <div className='flex flex-1 rounded-xl bg-gray-100 p-0.5 gap-0.5'>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-white shadow-sm text-gray-900"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            data-action-btn
            onClick={handleDownload}
            disabled={isDownloading || isCopying}
            title='Download image'
            className='flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg border border-mf-red text-mf-red hover:bg-mf-red hover:text-white transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isDownloading ? (
              <svg
                className='animate-spin w-3.5 h-3.5'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v8z'
                />
              </svg>
            ) : (
              <svg
                className='w-3.5 h-3.5'
                fill='none'
                stroke='currentColor'
                strokeWidth={2}
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 4v11'
                />
              </svg>
            )}
          </button>

          <button
            data-action-btn
            onClick={handleCopy}
            disabled={isCopying || isDownloading}
            title={copied ? "Copied!" : "Copy image to clipboard"}
            className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg border transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${
              copied
                ? "border-green-500 text-green-500 bg-green-50"
                : "border-mf-red text-mf-red hover:bg-mf-red hover:text-white"
            }`}
          >
            {isCopying ? (
              <svg
                className='animate-spin w-3.5 h-3.5'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                />
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8v8z'
                />
              </svg>
            ) : copied ? (
              <svg
                className='w-3.5 h-3.5'
                fill='none'
                stroke='currentColor'
                strokeWidth={2.5}
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M5 13l4 4L19 7'
                />
              </svg>
            ) : (
              <svg
                className='w-3.5 h-3.5'
                fill='none'
                stroke='currentColor'
                strokeWidth={2}
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                />
              </svg>
            )}
          </button>
        </div>

        {activeTab === "monthly" && (
          <MonthCalendarPicker
            availableMonths={availableMonths}
            selectedMonth={selectedMonth}
            currentMonth={curKey}
            isLoading={isLoadingMonth}
            displayLabel={displayLabel}
            onSelect={setSelectedMonth}
          />
        )}
      </div>

      {/* ── Body — ref attached so we can temporarily remove scroll for capture ── */}
      <div
        ref={bodyRef}
        className='lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:[&::-webkit-scrollbar]:hidden lg:[-ms-overflow-style:none] lg:[scrollbar-width:none]'
      >
        {isLoadingMonth ? (
          <div className='flex flex-col items-center justify-center py-14 px-4 gap-3'>
            <svg
              className='animate-spin w-8 h-8 text-mf-red'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8v8z'
              />
            </svg>
            <p className='text-xs text-gray-400 font-medium'>
              Loading {formatMonthKey(selectedMonth)}…
            </p>
          </div>
        ) : top10.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-14 px-4 text-center gap-2'>
            <span className='text-4xl'>😴</span>
            <p className='text-sm font-semibold text-gray-500 mt-1'>
              No activity yet
            </p>
            <p className='text-xs text-gray-400'>
              No contributions recorded for {displayLabel}.
            </p>
          </div>
        ) : (
          <>
            {/* Podium */}
            <div className='relative px-4 pt-4 pb-1'>
              <div
                className='absolute inset-0 pointer-events-none'
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 100%, rgba(251,191,36,0.08) 0%, transparent 70%)",
                }}
              />
              <div className='relative flex items-end justify-center gap-2'>
                {PODIUM_SLOTS.map((slot) => {
                  const scorer = podium3[slot.rankIndex];
                  if (!scorer) return null;
                  return (
                    <button
                      key={scorer.username}
                      onClick={() => onViewDetails(scorer)}
                      className={`flex flex-col items-center group focus:outline-none ${
                        slot.selfEnd ? "self-end" : ""
                      }`}
                    >
                      <span
                        className={`${slot.crownSize} select-none mb-1 block`}
                        style={{
                          animation: `trophyFloat ${slot.crownDuration} ease-in-out infinite`,
                          filter: slot.crownFilter,
                        }}
                      >
                        👑
                      </span>
                      <div className='relative mb-1'>
                        <div
                          className='absolute inset-0 rounded-full blur-lg scale-[1.3] opacity-75'
                          style={{ background: slot.glowColor }}
                        />
                        <div
                          className='relative p-[2.5px] rounded-full'
                          style={{
                            background: `linear-gradient(135deg, ${slot.ringFrom}, ${slot.ringTo})`,
                          }}
                        >
                          <div className='p-[2px] rounded-full bg-white'>
                            <div
                              className={`relative ${slot.avatarSize} rounded-full overflow-hidden group-hover:scale-105 transition-transform duration-300`}
                            >
                              <Image
                                src={scorer.avatar_url}
                                alt={scorer.username}
                                fill
                                className='object-cover'
                                sizes='72px'
                              />
                            </div>
                          </div>
                        </div>
                        <span
                          className={`absolute -bottom-1 -right-1 w-[22px] h-[22px] rounded-full ${slot.badgeBg} border-2 border-white flex items-center justify-center text-[10px] font-black text-white shadow-lg`}
                        >
                          {slot.podiumNum}
                        </span>
                      </div>
                      <p
                        className={`${slot.nameSz} font-bold text-gray-800 truncate max-w-[72px] mt-2 group-hover:text-mf-red transition-colors duration-150`}
                      >
                        {scorer.username}
                      </p>
                      <p
                        className={`${slot.scoreSz} font-semibold ${slot.scoreColor} mb-2 tabular-nums`}
                      >
                        {scorer.total_score.toLocaleString()} pts
                      </p>
                      <div
                        className={`w-[72px] ${slot.podiumHeight} rounded-t-xl bg-gradient-to-b ${slot.podiumGradient} relative overflow-hidden shadow-lg`}
                      >
                        <div className='absolute top-0 left-2.5 w-2 h-full bg-white/25 -skew-x-6 rounded-full' />
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <span className='text-white/70 font-black text-xl leading-none select-none'>
                            {slot.podiumNum}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className='h-0.5 mt-1 rounded-full bg-gradient-to-r from-transparent via-gray-200 to-transparent' />
            </div>

            {/* Ranks 4–10 */}
            {rest.length > 0 && (
              <div className='px-3 py-2 flex flex-col gap-1'>
                <div className='hidden lg:flex flex-col gap-1'>
                  {rest.map((scorer, i) => (
                    <RankRow
                      key={scorer.username}
                      scorer={scorer}
                      rank={i + 4}
                      pct={Math.round((scorer.total_score / maxScore) * 100)}
                      accentClass={
                        RANK_ROW_ACCENT[Math.min(i, RANK_ROW_ACCENT.length - 1)]
                      }
                      onViewDetails={onViewDetails}
                    />
                  ))}
                </div>
                <div className='lg:hidden flex flex-col gap-1'>
                  <button
                    onClick={() => setMobileRestOpen((v) => !v)}
                    className='w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-bold text-gray-600 hover:bg-red-50 hover:border-red-100 hover:text-mf-red transition-all duration-150'
                  >
                    <span>Ranks 4–{Math.min(10, rest.length + 3)}</span>
                    <span
                      className='transition-transform duration-300'
                      style={{
                        display: "inline-block",
                        transform: mobileRestOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      ▾
                    </span>
                  </button>
                  <div
                    data-mobile-rank-list
                    className='overflow-hidden transition-all duration-300 ease-in-out flex flex-col gap-1'
                    style={{
                      maxHeight: mobileRestOpen
                        ? `${rest.length * 56}px`
                        : "0px",
                    }}
                  >
                    {rest.map((scorer, i) => (
                      <RankRow
                        key={scorer.username}
                        scorer={scorer}
                        rank={i + 4}
                        pct={Math.round((scorer.total_score / maxScore) * 100)}
                        accentClass={
                          RANK_ROW_ACCENT[
                            Math.min(i, RANK_ROW_ACCENT.length - 1)
                          ]
                        }
                        onViewDetails={onViewDetails}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Footer ── */}
      <div className='px-5 py-2.5 border-t border-gray-100 bg-gray-50/60 flex-shrink-0'>
        <p className='text-[10px] text-center text-gray-400 font-medium uppercase tracking-wider'>
          Click any contributor to view full profile
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

function RankRow({
  scorer,
  rank,
  pct,
  accentClass,
  onViewDetails,
}: {
  scorer: TopScorer;
  rank: number;
  pct: number;
  accentClass: string;
  onViewDetails: (c: TopScorer) => void;
}) {
  return (
    <button
      onClick={() => onViewDetails(scorer)}
      className='w-full flex items-center gap-2 group rounded-xl px-2.5 py-2 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all duration-150 text-left'
    >
      <span
        className={`flex-shrink-0 w-[22px] h-[22px] rounded-md border text-[10px] font-black flex items-center justify-center ${accentClass}`}
      >
        {rank}
      </span>
      <img
        src={scorer.avatar_url}
        alt={scorer.username}
        className='w-7 h-7 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-red-200 transition-all flex-shrink-0'
      />
      <div className='flex-1 min-w-0'>
        <p className='text-[11px] font-bold text-gray-800 truncate group-hover:text-mf-red transition-colors leading-none mb-1'>
          {scorer.username}
        </p>
        <div className='h-1 w-full bg-gray-100 rounded-full overflow-hidden'>
          <div
            className='h-full rounded-full bg-gradient-to-r from-mindfire-text-red to-orange-400 transition-all duration-700'
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <span className='flex-shrink-0 text-[11px] font-bold text-gray-500 group-hover:text-mf-red transition-colors tabular-nums'>
        {scorer.total_score.toLocaleString()}
      </span>
    </button>
  );
}
