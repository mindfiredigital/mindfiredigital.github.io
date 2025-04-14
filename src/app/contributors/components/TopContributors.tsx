"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  lastActiveDays: number | null;
}

interface TopContributorsProps {
  contributors: Contributor[];
}

const TopContributors = ({ contributors }: TopContributorsProps) => {
  const getLastActiveText = (days: number | null): string => {
    if (days === null) return "No recent activity";
    if (days === 0) return "Active today";
    if (days === 1) return "Active yesterday";
    return `Active ${days} days ago`;
  };

  return (
    <div className='relative items-center justify-center max-w-xl md:max-w-5xl px-2 sm:px-4 py-6'>
      {/* Title for mobile visibility */}
      {/* Contributors scroll container */}
      <div className='flex gap-2 sm:gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 px-2 sm:px-8 -mx-2 sm:mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'>
        {contributors.slice(0, 6).map((contributor) => (
          <Link
            key={contributor.login}
            href={contributor.html_url}
            target='_blank'
            className='flex-shrink-0 snap-center group w-[100px] sm:w-auto mx-1 sm:mx-0'
          >
            <div className='flex flex-col items-center gap-1 sm:gap-2'>
              {/* Avatar with gradient border - smaller on mobile */}
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
              {/* Username and contributions - adjusted for mobile */}
              <div className='text-center w-full'>
                <p className='font-medium text-xs sm:text-sm text-gray-800 truncate max-w-[90px] sm:max-w-[100px]'>
                  {contributor.login}
                </p>
                <p className='text-xs text-gray-500'>
                  {contributor.contributions} contributions
                </p>
                <p className='text-xs text-gray-400'>
                  {getLastActiveText(contributor.lastActiveDays)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TopContributors;
