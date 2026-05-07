import { useState, useRef, useEffect } from "react";

export type RangeStage = "from" | "to";

function toKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

export function useDateRangePicker(
  fromDate: string,
  toDate: string,
  onFromChange: (d: string) => void,
  onToChange: (d: string) => void
) {
  const today = new Date().toISOString().slice(0, 10);

  // Which calendar panel is open
  const [openPanel, setOpenPanel] = useState<RangeStage | null>(null);

  // Which month/year each panel is browsing
  const [fromCalYear, setFromCalYear] = useState(() => {
    const [y] = fromDate.split("-");
    return Number(y);
  });
  const [fromCalMonth, setFromCalMonth] = useState(() => {
    const [, m] = fromDate.split("-");
    return Number(m);
  });
  const [toCalYear, setToCalYear] = useState(() => {
    const [y] = toDate.split("-");
    return Number(y);
  });
  const [toCalMonth, setToCalMonth] = useState(() => {
    const [, m] = toDate.split("-");
    return Number(m);
  });

  const [yearPickerOpen, setYearPickerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync calendar view when controlled values change
  useEffect(() => {
    const [y, m] = fromDate.split("-");
    setFromCalYear(Number(y));
    setFromCalMonth(Number(m));
  }, [fromDate]);

  useEffect(() => {
    const [y, m] = toDate.split("-");
    setToCalYear(Number(y));
    setToCalMonth(Number(m));
  }, [toDate]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenPanel(null);
        setYearPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close year picker when panel changes
  useEffect(() => {
    if (!openPanel) setYearPickerOpen(false);
  }, [openPanel]);

  const calYear = openPanel === "to" ? toCalYear : fromCalYear;
  const calMonth = openPanel === "to" ? toCalMonth : fromCalMonth;

  function setCalYear(y: number) {
    if (openPanel === "to") setToCalYear(y);
    else setFromCalYear(y);
  }
  function setCalMonth(m: number) {
    if (openPanel === "to") setToCalMonth(m);
    else setFromCalMonth(m);
  }

  function prevMonth() {
    if (calMonth === 1) {
      setCalYear(calYear - 1);
      setCalMonth(12);
    } else setCalMonth(calMonth - 1);
  }
  function nextMonth() {
    if (calMonth === 12) {
      setCalYear(calYear + 1);
      setCalMonth(1);
    } else setCalMonth(calMonth + 1);
  }

  // Range of years to show in year picker (2019 → current year)
  const currentYear = new Date().getUTCFullYear();
  const years = Array.from({ length: currentYear - 2018 }, (_, i) => 2019 + i);
  const minYear = 2019;
  const maxYear = currentYear;

  // Day click handler
  function handleDayClick(day: number) {
    const clicked = toKey(calYear, calMonth, day);
    if (openPanel === "from") {
      onFromChange(clicked);
      // If the new from is after current to, reset to
      if (clicked > toDate) onToChange(clicked);
      setOpenPanel(null);
    } else {
      // to panel: must be >= from
      if (clicked < fromDate) {
        onFromChange(clicked);
        onToChange(fromDate);
      } else {
        onToChange(clicked);
      }
      setOpenPanel(null);
    }
  }

  // Compute the day grid for the current cal month
  function buildDayGrid(): (number | null)[] {
    const firstDow = new Date(calYear, calMonth - 1, 1).getDay(); // 0=Sun
    // Convert to Mon-first (0=Mon ... 6=Sun)
    const offset = (firstDow + 6) % 7;
    const daysInMonth = new Date(calYear, calMonth, 0).getDate();
    const cells: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // Pad to full rows of 7
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }

  // Classify a day cell for styling
  function getDayState(
    day: number | null
  ): "empty" | "from" | "to" | "in-range" | "normal" | "today" | "future" {
    if (!day) return "empty";
    const key = toKey(calYear, calMonth, day);
    if (key > today) return "future";
    if (key === fromDate) return "from";
    if (key === toDate) return "to";
    if (key > fromDate && key < toDate) return "in-range";
    if (key === today) return "today";
    return "normal";
  }

  function handleYearSelect(year: number) {
    setCalYear(year);
    setYearPickerOpen(false);
  }

  return {
    openPanel,
    setOpenPanel,
    calYear,
    calMonth,
    yearPickerOpen,
    setYearPickerOpen,
    dropdownRef,
    years,
    minYear,
    maxYear,
    prevMonth,
    nextMonth,
    buildDayGrid,
    getDayState,
    handleDayClick,
    handleYearSelect,
    today,
  };
}
