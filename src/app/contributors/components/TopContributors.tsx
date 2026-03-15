"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { TopContributorsProps } from "@/types";
import { BuildGroups } from "./BuildGroups";
import { INTERVAL_MS, PANEL_HEADER, PAUSE_ON_CLICK_MS } from "@/constants";

const TopContributors = ({
  contributors,
  topScorers,
}: TopContributorsProps) => {
  const groups = BuildGroups(contributors, topScorers);
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
                    {PANEL_HEADER.noContributor}
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
