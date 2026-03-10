"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { TopScorer } from "@/types";
import currentMonthRaw from "../../projects/assets/leaderboard-monthly.json";

interface TopScorersPanelProps {
  topScorers: TopScorer[];
  onViewDetails: (contributor: TopScorer) => void;
}

type TabId = "alltime" | "monthly";

interface MonthlyPayload {
  month_label: string;
  month_key?: string;
  leaderboard: TopScorer[];
}

interface Manifest {
  months: string[];
  updated_at?: string;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "alltime", label: "All Time" },
  { id: "monthly", label: "Month" },
];

const PODIUM_SLOTS = [
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

const RANK_ROW_ACCENT = [
  "text-yellow-600 bg-yellow-50 border-yellow-200",
  "text-slate-500 bg-slate-50 border-slate-200",
  "text-orange-500 bg-orange-50 border-orange-200",
  "text-gray-400 bg-gray-50 border-gray-200",
  "text-gray-400 bg-gray-50 border-gray-200",
  "text-gray-400 bg-gray-50 border-gray-200",
  "text-gray-400 bg-gray-50 border-gray-200",
];

const MONTH_NAMES_SHORT = [
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

async function toBase64Url(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function formatMonthKey(key: string): string {
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleString("default", { month: "long", year: "numeric" });
}

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}`;
}

function MonthCalendarPicker({
  availableMonths,
  selectedMonth,
  currentMonth,
  isLoading,
  displayLabel,
  onSelect,
}: {
  availableMonths: string[];
  selectedMonth: string;
  currentMonth: string;
  isLoading: boolean;
  displayLabel: string;
  onSelect: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [calYear, setCalYear] = useState(() => {
    const [y] = selectedMonth.split("-");
    return Number(y);
  });
  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableSet = new Set(availableMonths);
  const years = Array.from(
    new Set(availableMonths.map((k) => Number(k.split("-")[0])))
  ).sort((a, b) => a - b);
  const minYear = years[0] ?? calYear;
  const maxYear = years[years.length - 1] ?? calYear;

  useEffect(() => {
    const [y] = selectedMonth.split("-");
    setCalYear(Number(y));
  }, [selectedMonth]);

  useEffect(() => {
    if (!open) setYearPickerOpen(false);
  }, [open]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleMonthClick = (monthIdx: number) => {
    const key = `${calYear}-${String(monthIdx + 1).padStart(2, "0")}`;
    if (!availableSet.has(key)) return;
    onSelect(key);
    setOpen(false);
  };

  const handleYearSelect = (year: number) => {
    setCalYear(year);
    setYearPickerOpen(false);
  };

  return (
    <div className='relative mt-2.5' ref={dropdownRef} data-action-btn>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className='w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 hover:border-red-200 hover:bg-red-50 transition-all duration-150 group'
      >
        <div className='flex items-center gap-2 min-w-0'>
          <svg
            className='w-3.5 h-3.5 text-mf-red flex-shrink-0'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
            />
          </svg>
          <span className='text-[11px] font-bold text-gray-700 group-hover:text-mf-red transition-colors truncate'>
            {isLoading ? "Loading…" : displayLabel}
          </span>
        </div>
        <svg
          className='w-3.5 h-3.5 text-gray-400 flex-shrink-0 transition-transform duration-200'
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill='none'
          stroke='currentColor'
          strokeWidth={2}
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M19 9l-7 7-7-7'
          />
        </svg>
      </button>

      {open && (
        <div className='absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden'>
          {/* ── Year navigation bar ── */}
          <div className='flex items-center justify-between px-3 py-2.5 border-b border-gray-100 bg-gray-50/70'>
            {!yearPickerOpen ? (
              <>
                <button
                  onClick={() => setCalYear((y) => Math.max(y - 1, minYear))}
                  disabled={calYear <= minYear}
                  className='w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all'
                >
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
                      d='M15 19l-7-7 7-7'
                    />
                  </svg>
                </button>

                {/* Clickable year — opens year picker */}
                <button
                  onClick={() => setYearPickerOpen(true)}
                  className='flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-red-50 hover:text-mf-red transition-all duration-150 group/yr'
                >
                  <span className='text-[12px] font-black text-gray-800 group-hover/yr:text-mf-red tracking-tight transition-colors'>
                    {calYear}
                  </span>
                  {calYear === Number(currentMonth.split("-")[0]) && (
                    <span className='text-[8px] font-bold text-mf-red bg-red-50 border border-red-200 rounded-full px-1.5 py-0.5 uppercase tracking-wide leading-none'>
                      Now
                    </span>
                  )}
                  <svg
                    className='w-3 h-3 text-gray-400 group-hover/yr:text-mf-red transition-colors'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth={2.5}
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>

                <button
                  onClick={() => setCalYear((y) => Math.min(y + 1, maxYear))}
                  disabled={calYear >= maxYear}
                  className='w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all'
                >
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
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setYearPickerOpen(false)}
                  className='w-6 h-6 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white transition-all'
                >
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
                      d='M15 19l-7-7 7-7'
                    />
                  </svg>
                </button>
                <span className='text-[11px] font-black text-gray-700 uppercase tracking-widest'>
                  Select Year
                </span>
                <div className='w-6' />
              </>
            )}
          </div>

          {/* ── Year picker grid ── */}
          {yearPickerOpen ? (
            <div className='grid grid-cols-3 gap-1.5 p-3'>
              {years.map((year) => {
                const isSelectedYear = year === calYear;
                const isCurrentYear =
                  year === Number(currentMonth.split("-")[0]);
                return (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={`
                      relative flex flex-col items-center justify-center py-2.5 px-1 rounded-xl
                      text-[12px] font-bold transition-all duration-150
                      ${
                        isSelectedYear
                          ? "bg-mf-red text-white shadow-md scale-105 ring-2 ring-red-200"
                          : "text-gray-700 hover:bg-red-50 hover:text-mf-red hover:scale-105 cursor-pointer"
                      }
                    `}
                  >
                    {year}
                    {isCurrentYear && (
                      <span
                        className={`mt-0.5 w-1 h-1 rounded-full ${
                          isSelectedYear
                            ? "bg-white/70"
                            : "bg-mf-red animate-pulse"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className='grid grid-cols-4 gap-1 p-2.5'>
              {MONTH_NAMES_SHORT.map((name, idx) => {
                const key = `${calYear}-${String(idx + 1).padStart(2, "0")}`;
                const isAvailable = availableSet.has(key);
                const isSelected = key === selectedMonth;
                const isCurrent = key === currentMonth;

                return (
                  <button
                    key={key}
                    onClick={() => handleMonthClick(idx)}
                    disabled={!isAvailable}
                    className={`
                      relative flex flex-col items-center justify-center py-2 px-1 rounded-xl text-[11px] font-bold
                      transition-all duration-150
                      ${
                        isSelected
                          ? "bg-mf-red text-white shadow-md scale-105"
                          : isAvailable
                            ? "text-gray-700 hover:bg-red-50 hover:text-mf-red cursor-pointer"
                            : "text-gray-300 cursor-not-allowed"
                      }
                    `}
                  >
                    {name}
                    {isCurrent && (
                      <span
                        className={`mt-0.5 w-1 h-1 rounded-full ${
                          isSelected ? "bg-white/70" : "bg-mf-red"
                        }`}
                      />
                    )}
                    {isAvailable && !isSelected && (
                      <span className='absolute top-1 right-1 w-1 h-1 rounded-full bg-green-400 opacity-70' />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {!yearPickerOpen && (
            <div className='flex items-center justify-center gap-3 px-3 pb-2.5 pt-0.5'>
              <div className='flex items-center gap-1'>
                <span className='w-1.5 h-1.5 rounded-full bg-green-400' />
                <span className='text-[9px] text-gray-400 font-medium'>
                  Has data
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <span className='w-1.5 h-1.5 rounded-full bg-mf-red' />
                <span className='text-[9px] text-gray-400 font-medium'>
                  Current month
                </span>
              </div>
              <div className='flex items-center gap-1'>
                <span className='w-2 h-2 rounded-sm bg-mf-red' />
                <span className='text-[9px] text-gray-400 font-medium'>
                  Selected
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function TopScorersPanel({
  topScorers,
  onViewDetails,
}: TopScorersPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("alltime");
  const [mobileRestOpen, setMobileRestOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const captureImage = useCallback(async (): Promise<string> => {
    const { toPng } = await import("html-to-image");
    const imgEls = Array.from(
      containerRef.current!.querySelectorAll("img")
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
      containerRef.current!.querySelectorAll("[data-action-btn]")
    ) as HTMLElement[];
    actionBtns.forEach((btn) => (btn.style.visibility = "hidden"));
    const dataUrl = await toPng(containerRef.current!, {
      cacheBust: true,
      pixelRatio: 2,
    });
    actionBtns.forEach((btn) => (btn.style.visibility = "visible"));
    imgEls.forEach((img, i) => (img.src = originalSrcs[i]));
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

      {/* ── Body ── */}
      <div className='lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:[&::-webkit-scrollbar]:hidden lg:[-ms-overflow-style:none] lg:[scrollbar-width:none]'>
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
