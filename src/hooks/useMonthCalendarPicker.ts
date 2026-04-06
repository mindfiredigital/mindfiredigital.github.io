import { useState, useRef, useEffect } from "react";

export function useMonthCalendarPicker(
  availableMonths: string[],
  selectedMonth: string,
  onSelect: (key: string) => void
) {
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

  return {
    open,
    setOpen,
    calYear,
    setCalYear,
    yearPickerOpen,
    setYearPickerOpen,
    dropdownRef,
    availableSet,
    years,
    minYear,
    maxYear,
    handleMonthClick,
    handleYearSelect,
  };
}
