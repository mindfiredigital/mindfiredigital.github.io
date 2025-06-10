import { useEffect, useState } from "react";
import moment from "moment";
import { Package, NpmStats } from "@/types";
import statsList from "../app/projects/assets/stats.json";

export function usePackageStats() {
  const [startDate, setStartDate] = useState(moment().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);
  const [selectedRange, setSelectedRange] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package>({
    name: "fmdapi-node-weaver",
    title: "FMD API Node Weaver",
    type: "npm",
    day: 0,
    week: 3,
    year: 70,
    total: 70,
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [packages, setPackages] = useState<Package[]>(statsList as Package[]);

  function openModal() {
    setIsOpen(true);
    setCount(selectedPackage.total || 0);
  }

  function closeModal() {
    setIsOpen(false);
    setSelectedRange(false);
  }

  async function fetchNpmStats(
    packageName: string,
    period: string
  ): Promise<NpmStats> {
    setLoading(true);
    const url = `https://api.npmjs.org/downloads/range/${period}/@mindfiredigital/${packageName}`;
    const response = await fetch(url);

    if (!response.ok) {
      console.log(
        `Failed to fetch download stats for ${packageName} (${period}): ${response.statusText}`
      );
      setLoading(false);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setLoading(false);
    return data;
  }

  function calculateDownloads(stats: NpmStats): number {
    if (!stats || !stats.downloads) {
      return 0;
    }
    return stats.downloads.reduce(
      (acc, download) => acc + download.downloads,
      0
    );
  }

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    if (!selectedPackage) return;

    const range = getDateRange(event.target.value);

    if (selectedPackage.type === "npm") {
      fetchNpmStats(selectedPackage.name, `${range.start}:${range.end}`).then(
        (res) => {
          setLoading(true);
          const count = calculateDownloads(res);
          setCount(count);
          setLoading(false);
        }
      );
    } else if (selectedPackage.type === "pypi") {
      setCount(Number(event.target.value) || 0);
    }
  }

  function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
  }

  function getDateRange(range: string) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();

    switch (range.toLowerCase()) {
      case "today":
        setSelectedRange(false);
        return {
          start: formatDate(new Date(currentYear, currentMonth, currentDay)),
          end: formatDate(new Date(currentYear, currentMonth, currentDay)),
        };
      case "yesterday": {
        setSelectedRange(false);
        const yesterdayDate = new Date(
          currentYear,
          currentMonth,
          currentDay - 1
        );
        return {
          start: formatDate(yesterdayDate),
          end: formatDate(yesterdayDate),
        };
      }
      case "last month": {
        setSelectedRange(false);
        const lastMonthStartDate = new Date(currentYear, currentMonth - 1, 1);
        const lastMonthEndDate = new Date(currentYear, currentMonth, 0);
        return {
          start: formatDate(lastMonthStartDate),
          end: formatDate(lastMonthEndDate),
        };
      }
      case "this month": {
        setSelectedRange(false);
        const thisMonthStartDate = new Date(currentYear, currentMonth, 1);
        return {
          start: formatDate(thisMonthStartDate),
          end: formatDate(currentDate),
        };
      }
      case "last quarter": {
        setSelectedRange(false);
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        const lastQuarterStartDate = new Date(
          currentYear,
          quarterStartMonth - 3,
          1
        );
        const lastQuarterEndDate = new Date(currentYear, quarterStartMonth, 0);
        return {
          start: formatDate(lastQuarterStartDate),
          end: formatDate(lastQuarterEndDate),
        };
      }
      case "this year": {
        setSelectedRange(false);
        const thisYearStartDate = new Date(currentYear, 0, 1);
        return {
          start: formatDate(thisYearStartDate),
          end: formatDate(currentDate),
        };
      }
      case "custom": {
        setSelectedRange(true);
        setCount(0);
        return {
          start: formatDate(new Date(currentYear, currentMonth, currentDay)),
          end: formatDate(new Date(currentYear, currentMonth, currentDay)),
        };
      }
      default: {
        setSelectedRange(false);
        return {
          start: "1000-01-01",
          end: "3000-01-01",
        };
      }
    }
  }
  const generateChart = async () => {
    if (selectedPackage.type === "npm") {
      const stats = await fetchNpmStats(
        selectedPackage.name,
        `${startDate}:${endDate}`
      );
      setCount(calculateDownloads(stats));
    }
  };

  useEffect(() => {
    if (selectedPackage) {
      setCount(selectedPackage.total || 0); //update total count when npmPackage is updated
    }
  }, [selectedPackage]);

  useEffect(() => {
    if (selectedRange && selectedPackage.type === "npm") {
      generateChart();
    }
  }, [startDate, endDate, selectedRange, selectedPackage]);

  return {
    openModal,
    closeModal,
    setStartDate,
    setEndDate,
    loading,
    count,
    isOpen,
    handleChange,
    packages,
    selectedRange,
    selectedPackage,
    setSelectedPackage,
    startDate,
    endDate,
  };
}
