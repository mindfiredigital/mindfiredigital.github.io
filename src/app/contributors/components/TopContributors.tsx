"use client";

import React, { useState, useEffect, useRef } from "react";
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

const getLastActiveText = (days: number | null): string => {
  if (days === null) return "No recent activity";
  if (days === 0) return "Active today";
  if (days === 1) return "Active yesterday";
  return `Active ${days} days ago`;
};

function buildGroups(
  contributors: Contributor[],
  topScorers: TopScorer[]
): { label: string; items: DisplayContributor[] }[] {
  const recentlyActive = [...contributors]
    .filter((c) => c.lastActiveDays !== null && c.lastActiveDays <= 30)
    .sort((a, b) => (a.lastActiveDays ?? 99) - (b.lastActiveDays ?? 99))
    .slice(0, 6)
    .map((c) => ({
      login: c.login,
      avatar_url: c.avatar_url,
      html_url: c.html_url,
      stat: getLastActiveText(c.lastActiveDays),
    }));

  const topByScore = [...topScorers]
    .sort((a, b) => b.total_score - a.total_score)
    .slice(0, 6)
    .map((s) => ({
      login: s.username,
      avatar_url: s.avatar_url,
      html_url: s.html_url,
      stat: `${s.total_score.toLocaleString()} pts`,
    }));

  const topByPRs = [...topScorers]
    .sort((a, b) => b.totalPRs - a.totalPRs)
    .slice(0, 6)
    .map((s) => ({
      login: s.username,
      avatar_url: s.avatar_url,
      html_url: s.html_url,
      stat: `${s.totalPRs} pull requests`,
    }));

  return [
    { label: "Top Active Contributors", items: recentlyActive },
    { label: "Top Contributors by Score", items: topByScore },
    { label: "Top Contributors by PRs", items: topByPRs },
  ];
}

const INTERVAL_MS = 4000;
const OUT_MS = 350; // rotate out duration
const IN_MS = 400; // rotate in duration

const TopContributors = ({
  contributors,
  topScorers,
}: TopContributorsProps) => {
  const groups = buildGroups(contributors, topScorers);
  const [shownIndex, setShownIndex] = useState(0); // what's rendered
  const [activeIndex, setActiveIndex] = useState(0); // dot highlight
  const [rotateStyle, setRotateStyle] = useState<React.CSSProperties>({});
  const animating = useRef(false);

  const goTo = (next: number) => {
    if (animating.current || next === activeIndex) return;
    animating.current = true;

    // 1. Rotate current OUT → 90deg (face disappears)
    setRotateStyle({
      transform: "rotateY(90deg)",
      opacity: 0,
      transition: `transform ${OUT_MS}ms cubic-bezier(0.4,0,1,1),
                   opacity   ${OUT_MS * 0.6}ms ease`,
    });

    setTimeout(() => {
      // 2. Instantly snap to -90deg (coming from the other side), no transition
      setRotateStyle({
        transform: "rotateY(-90deg)",
        opacity: 0,
        transition: "none",
      });
      setShownIndex(next);
      setActiveIndex(next);

      // 3. One frame later: rotate IN → 0deg
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setRotateStyle({
            transform: "rotateY(0deg)",
            opacity: 1,
            transition: `transform ${IN_MS}ms cubic-bezier(0,0,0.2,1),
                         opacity   ${IN_MS * 0.5}ms ease`,
          });
          setTimeout(() => {
            animating.current = false;
          }, IN_MS);
        });
      });
    }, OUT_MS);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      goTo((activeIndex + 1) % groups.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [activeIndex, groups.length]);

  const current = groups[shownIndex];

  return (
    <div
      className='relative items-center justify-center max-w-xl md:max-w-5xl px-2 sm:px-4 py-6'
      style={{ perspective: "1000px" }}
    >
      {/* Rotating wrapper */}
      <div style={{ transformStyle: "preserve-3d", ...rotateStyle }}>
        {/* Label */}
        <div className='flex flex-col items-center gap-2 mb-4'>
          <p className='text-sm font-semibold text-mindfire-text-red tracking-wide uppercase'>
            {current.label}
          </p>
          <div className='flex gap-1.5'>
            {groups.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
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

        {/* Contributors strip — original UI completely unchanged */}
        <div className='flex gap-2 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 px-2 sm:px-8 -mx-2 sm:mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
          {current.items.map((contributor) => (
            <Link
              key={contributor.login}
              href={contributor.html_url}
              target='_blank'
              className='flex-shrink-0 snap-center group w-[100px] sm:w-auto mx-1 sm:mx-0'
            >
              <div className='flex flex-col items-center gap-1 sm:gap-2'>
                <div className='p-0.5 sm:p-1 rounded-full bg-gradient-to-tr from-mindfire-text-red via-orange-500 to-yellow-500'>
                  <div className='p-0.5 rounded-full bg-white'>
                    <div className='relative w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden group-hover:scale-105 transition-transform'>
                      <Image
                        src={contributor.avatar_url}
                        alt={contributor.login}
                        fill
                        className='object-cover'
                        sizes='(max-width: 640px) 56px, 80px'
                      />
                    </div>
                  </div>
                </div>
                <div className='text-center w-full'>
                  <p className='font-medium text-xs sm:text-sm text-gray-800 truncate max-w-[90px] sm:max-w-[100px]'>
                    {contributor.login}
                  </p>
                  <p className='text-xs text-gray-500'>{contributor.stat}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopContributors;
