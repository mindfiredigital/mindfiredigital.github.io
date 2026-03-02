"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Contributor, TopScorer } from "@/types";

interface TopContributorsProps {
  contributors: Contributor[];
  topScorers: TopScorer[];
}

interface DisplayContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  stat: string;
}

function buildGroups(
  contributors: Contributor[],
  topScorers: TopScorer[]
): { label: string; icon: string; items: DisplayContributor[] }[] {
  const activeThisWeek = [...contributors]
    .filter((c) => c.lastActiveDays !== null && c.lastActiveDays <= 7)
    .sort((a, b) => (a.lastActiveDays ?? 99) - (b.lastActiveDays ?? 99))
    .slice(0, 6)
    .map((c) => ({
      login: c.login,
      avatar_url: c.avatar_url,
      html_url: c.html_url,
      stat:
        c.lastActiveDays === 0
          ? "Active today"
          : c.lastActiveDays === 1
            ? "Active yesterday"
            : `Active ${c.lastActiveDays}d ago`,
    }));

  const activeThisMonth = [...contributors]
    .filter((c) => c.lastActiveDays !== null && c.lastActiveDays <= 30)
    .sort((a, b) => (a.lastActiveDays ?? 99) - (b.lastActiveDays ?? 99))
    .slice(0, 6)
    .map((c) => ({
      login: c.login,
      avatar_url: c.avatar_url,
      html_url: c.html_url,
      stat: `Active ${c.lastActiveDays}d ago`,
    }));

  const topByPRs = [...topScorers]
    .sort((a, b) => b.totalPRs - a.totalPRs)
    .slice(0, 6)
    .map((s) => ({
      login: s.username,
      avatar_url: s.avatar_url,
      html_url: s.html_url,
      stat: `${s.totalPRs} PRs`,
    }));

  const topByCommits = [...topScorers]
    .sort((a, b) => b.totalCommits - a.totalCommits)
    .slice(0, 6)
    .map((s) => ({
      login: s.username,
      avatar_url: s.avatar_url,
      html_url: s.html_url,
      stat: `${s.totalCommits} commits`,
    }));

  return [
    {
      label: "Active This Week",
      icon: "",
      items:
        activeThisWeek.length > 0
          ? activeThisWeek
          : activeThisMonth.slice(0, 6),
    },
    {
      label: "Most PRs Raised",
      icon: "",
      items: topByPRs,
    },
    {
      label: "Top by Commits",
      icon: "",
      items: topByCommits,
    },
  ];
}

const INTERVAL_MS = 4000;
const PAUSE_ON_CLICK_MS = 8000;

const TopContributors = ({
  contributors,
  topScorers,
}: TopContributorsProps) => {
  const groups = buildGroups(contributors, topScorers);
  const [activeIndex, setActiveIndex] = useState(0);
  const pausedUntilRef = useRef<number>(0);

  const startTimer = useCallback(() => {
    const timer = setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      setActiveIndex((prev) => (prev + 1) % groups.length);
    }, INTERVAL_MS);
    return timer;
  }, [groups.length]);

  useEffect(() => {
    const timer = startTimer();
    return () => clearInterval(timer);
  }, [startTimer]);

  const handleDotClick = (i: number) => {
    pausedUntilRef.current = Date.now() + PAUSE_ON_CLICK_MS;
    setActiveIndex(i);
  };

  return (
    <div className='relative w-full px-2 sm:px-4 py-6 flex flex-col items-center overflow-hidden'>
      <div className='w-full overflow-hidden'>
        <div
          className='flex'
          style={{
            width: `${groups.length * 100}%`,
            transform: `translateX(-${(activeIndex * 100) / groups.length}%)`,
            transition: "transform 600ms cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {groups.map((group, gi) => (
            <div
              key={gi}
              className='flex flex-col items-center'
              style={{ width: `${100 / groups.length}%` }}
            >
              <p className='text-sm font-semibold text-mindfire-text-red tracking-wide uppercase mb-4 flex items-center gap-1.5'>
                <span>{group.icon}</span>
                {group.label}
              </p>

              <div className='flex justify-center gap-2 sm:gap-5 w-full flex-wrap sm:flex-nowrap pb-4 px-2 sm:px-6'>
                {group.items.map((contributor) => (
                  <Link
                    key={contributor.login}
                    href={contributor.html_url}
                    target='_blank'
                    className='flex-shrink-0 group w-[90px] sm:w-auto'
                  >
                    <div className='flex flex-col items-center gap-1 sm:gap-2'>
                      <div className='p-0.5 sm:p-1 rounded-full bg-gradient-to-tr from-mindfire-text-red via-orange-500 to-yellow-500'>
                        <div className='p-0.5 rounded-full bg-white'>
                          <div className='relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden group-hover:scale-105 transition-transform'>
                            <Image
                              src={contributor.avatar_url}
                              alt={contributor.login}
                              fill
                              className='object-cover'
                              sizes='(max-width: 640px) 56px, 64px'
                            />
                          </div>
                        </div>
                      </div>
                      <div className='text-center w-full'>
                        <p className='font-medium text-xs sm:text-sm text-gray-800 truncate max-w-[90px] sm:max-w-[100px]'>
                          {contributor.login}
                        </p>
                        <p className='text-xs text-gray-500 truncate max-w-[90px]'>
                          {contributor.stat}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}

                {group.items.length === 0 && (
                  <p className='text-sm text-gray-400 py-8'>
                    No contributors found
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='flex gap-1.5 mt-1'>
        {groups.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDotClick(i)}
            className='rounded-full transition-all duration-500'
            style={{
              width: i === activeIndex ? "16px" : "6px",
              height: "6px",
              background:
                i === activeIndex
                  ? "var(--color-mindfire-text-red, #e63b3b)"
                  : "#d1d5db",
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default TopContributors;
