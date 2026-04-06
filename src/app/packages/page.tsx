"use client";

import { useState, useEffect } from "react";
import PackageCount from "./components/PackageCount";
import TotalDownloads from "./components/TotalDownloads";
import PackageFilterToggle from "./components/PackageFilterToggle";
import PackageCard from "./components/PackageCard";
import MonorepoPackagesModal from "./components/MonorepoPackagesModal";
import { usePackageStats } from "@/hooks";
import { groupPackages } from "@/app/utils";
import { GroupedPackage, ProjectGroupedData, FilterType } from "@/types";
import { STATS_HERO } from "@/constants";

import projectsGroupedData from "@/asset/projects_grouped.json";
import dynamic from "next/dynamic";

// Dynamic import for Package Stats Modal
const PackageStatsModal = dynamic(
  () => import("./components/PackageStatsModal"),
  {
    loading: () => <div className='skeleton h-48 w-full rounded-lg' />,
    ssr: false,
  }
);

/* Stats page displaying package analytics and download statistics */
const Stats = () => {
  const {
    startDate,
    endDate,
    openModal,
    closeModal,
    setStartDate,
    setEndDate,
    loading,
    count,
    isOpen,
    handleChange,
    packages,
    selectedPackage,
    setSelectedPackage,
    selectedRange,
  } = usePackageStats();

  const [showPackagesModal, setShowPackagesModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupedPackage | null>(
    null
  );
  const [groupedPackages, setGroupedPackages] = useState<GroupedPackage[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  /* Group packages whenever the package list updates */
  useEffect(() => {
    if (packages.length > 0) {
      const grouped = groupPackages(
        packages,
        projectsGroupedData as ProjectGroupedData[]
      );
      setGroupedPackages(grouped);
    }
  }, [packages]);

  /* Filter grouped packages based on the selected filter type */
  const filteredPackages = groupedPackages.filter((group) => {
    if (activeFilter === "all") return true;
    return group.packages.some(
      (pkg) => pkg.type?.toLowerCase() === activeFilter
    );
  });

  /* Calculate total downloads across all filtered package groups */
  const totalDownloads = filteredPackages.reduce(
    (sum, group) => sum + (group.totalDownloads || 0),
    0
  );

  /* Calculate total number of packages across filtered groups */
  const totalPackageCount = filteredPackages.reduce(
    (sum, group) => sum + group.packages.length,
    0
  );

  return (
    <section className='bg-slate-50'>
      <div className='container mx-auto flex flex-col gap-4 items-center'>
        <div className='flex items-center gap-4 mt-10'>
          <h1 className='text-4xl leading-10 md:text-5xl md:!leading-[3.5rem] tracking-wide text-mindfire-text-black'>
            {STATS_HERO.heading}
          </h1>
          <PackageCount totalPackages={totalPackageCount} />
        </div>

        <p className='mt-6 text-xl text-mf-light-grey tracking-wide text-center px-4'>
          {STATS_HERO.subheading}
        </p>

        <TotalDownloads totalDownloads={totalDownloads} />

        <PackageFilterToggle
          activeFilter={activeFilter}
          onChange={setActiveFilter}
        />

        <div className='w-full'>
          <div className='mt-8 px-8 grid gap-6 max-w-6xl mx-auto grid-cols-1 md:grid-cols-2 lg:grid-cols-3 place-items-center'>
            {filteredPackages.map((group) => (
              <PackageCard
                key={group.id}
                group={group}
                onFilterClick={() => {
                  setSelectedPackage(group.packages[0]);
                  openModal();
                }}
                onViewAllClick={() => {
                  setSelectedGroup(group);
                  setShowPackagesModal(true);
                }}
              />
            ))}
          </div>
        </div>

        <PackageStatsModal
          isOpen={isOpen}
          onClose={closeModal}
          selectedPackage={selectedPackage}
          selectedRange={selectedRange}
          loading={loading}
          count={count}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onRangeChange={handleChange}
        />

        <MonorepoPackagesModal
          isOpen={showPackagesModal}
          onClose={() => setShowPackagesModal(false)}
          selectedGroup={selectedGroup}
          onPackageFilterClick={(pkg) => {
            setSelectedPackage(pkg);
            setShowPackagesModal(false);
            openModal();
          }}
        />
      </div>
    </section>
  );
};

export default Stats;
