"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface Contributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

interface TopContributorsProps {
  contributors: Contributor[];
}

const TopContributors = ({ contributors }: TopContributorsProps) => {
  return (
    <div className='relative  items-center max-w-5xl mx-auto px-4 py-8'>
      {/* Contributors scroll container */}
      <div className='flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-px-6 px-8'>
        {contributors.slice(0, 6).map((contributor) => (
          <Link
            key={contributor.login}
            href={contributor.html_url}
            target='_blank'
            className='flex-shrink-0 snap-center group'
          >
            <div className='flex flex-col items-center gap-2'>
              {/* Avatar with gradient border */}
              <div className='p-1 rounded-full bg-gradient-to-tr from-mindfire-text-red via-orange-500 to-yellow-500'>
                <div className='p-0.5 rounded-full bg-white'>
                  <div className='relative w-20 h-20 rounded-full overflow-hidden group-hover:scale-105 transition-transform'>
                    <Image
                      src={contributor.avatar_url}
                      alt={contributor.login}
                      fill
                      className='object-cover'
                    />
                  </div>
                </div>
              </div>
              {/* Username and contributions */}
              <div className='text-center'>
                <p className='font-medium text-sm text-gray-800 truncate max-w-[100px]'>
                  {contributor.login}
                </p>
                <p className='text-xs text-gray-500'>
                  {contributor.contributions} contributions
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
