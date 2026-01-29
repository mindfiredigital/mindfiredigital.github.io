import { useEffect, useState } from "react";
import moment from "moment";
import { Package, NpmStats } from "@/types";
import packagesList from "../app/projects/assets/packages.json";
import statsData from "../app/projects/assets/stats.json";

// Helper to extract package name from URL
function extractPackageNameFromUrl(url: string): string | null {
  if (!url) return null;
  const npmMatch = url.match(/\/package\/@mindfiredigital\/(.+?)(?:\/|$)/);
  if (npmMatch) return npmMatch[1];
  const pypiMatch = url.match(/\/project\/(.+?)(?:\/|$)/);
  if (pypiMatch) return pypiMatch[1];
  const nugetMatch = url.match(/nuget\.org\/packages\/(.+?)(?:\/|$)/);
  if (nugetMatch) return nugetMatch[1];
  return null;
}

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
    url: "",
    status: "",
  });

  // Merge packages.json with stats.json
  const [packages] = useState<Package[]>(() => {
    const statsByUrl = new Map<string, Package>();
    const statsByName = new Map<string, Package>();

    (statsData as Package[]).forEach((stat) => {
      // Index by URL
      if (stat.url) {
        statsByUrl.set(stat.url.toLowerCase().trim(), stat);
      }
      // Index by package name from URL
      if (stat.url) {
        const pkgName = extractPackageNameFromUrl(stat.url);
        if (pkgName) {
          statsByName.set(pkgName.toLowerCase(), stat);
        }
      }
      // Index by name field
      statsByName.set(stat.name.toLowerCase().trim(), stat);
    });

    return (packagesList as Package[]).map((pkg) => {
      // Try matching by URL first
      let stats = statsByUrl.get(pkg.url?.toLowerCase().trim() || "");

      // Try matching by extracted package name from URL
      if (!stats && pkg.url) {
        const pkgName = extractPackageNameFromUrl(pkg.url);
        if (pkgName) {
          stats = statsByName.get(pkgName.toLowerCase());
        }
      }

      // Try matching by name
      if (!stats) {
        stats = statsByName.get(pkg.name.toLowerCase().trim());
      }

      return {
        ...pkg,
        day: stats?.day || 0,
        week: stats?.week || 0,
        year: stats?.year || 0,
        total: stats?.total || 0,
        last_day: stats?.last_day || 0,
        last_week: stats?.last_week || 0,
        last_month: stats?.last_month || 0,
      };
    });
  });

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

    try {
      const response = await fetch(url);

      if (!response.ok) {
        console.log(
          `Failed to fetch download stats for ${packageName} (${period}): ${response.statusText}`
        );
        setLoading(false);
        return { downloads: [] }; // ← RETURN EMPTY instead of throwing
      }

      const data = await response.json();
      setLoading(false);
      return data;
    } catch (error) {
      console.error(`Error fetching stats for ${packageName}:`, error);
      setLoading(false);
      return { downloads: [] }; // ← RETURN EMPTY on error
    }
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
      const pkgName =
        extractPackageNameFromUrl(selectedPackage.url || "") ||
        selectedPackage.name;

      fetchNpmStats(pkgName, `${range.start}:${range.end}`).then((res) => {
        const count = calculateDownloads(res);
        setCount(count);
      });
    }
    // Update this block to include nuget
    else if (
      ["pypi", "pypi", "nuget"].includes(selectedPackage.type.toLowerCase())
    ) {
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
      const pkgName =
        extractPackageNameFromUrl(selectedPackage.url || "") ||
        selectedPackage.name;
      const stats = await fetchNpmStats(pkgName, `${startDate}:${endDate}`);
      setCount(calculateDownloads(stats));
    }
  };

  useEffect(() => {
    if (selectedPackage) {
      setCount(selectedPackage.total || 0);
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
