"use client";

import Link from "next/link";
import Image from "next/image";
import { PackageCardProps } from "@/types";
import { PACKAGE_CARD_LABELS, GITHUB_BASE_URL } from "@/constants";

/**
 * PackageCard Component
 *
 * Displays a package or monorepo group card showing:
 * - Project name
 * - Total downloads
 * - Registry link (npm / PyPI / NuGet)
 * - GitHub repository link
 * - Optional filter action or "View All Packages" button for monorepos
 */
export default function PackageCard({
  group,
  onFilterClick,
  onViewAllClick,
}: PackageCardProps) {
  return (
    /**
     * Main card container
     * Displays package information with hover scaling effect
     */
    <div className='border p-4 rounded bg-white flex flex-col justify-between drop-shadow-md w-full max-w-xs h-48 hover:scale-105 transition-transform'>
      {/* Header section containing project title and download statistics */}
      <div className='flex flex-row items-start justify-between'>
        <div className='flex-1'>
          {/* Project / package group title */}
          <h3 className='font-semibold mb-2 ml-2 text-mindfire-text-black capitalize'>
            {group.baseTitle}
          </h3>
          {group.isMonorepo && (
            <span className='ml-2 inline-block bg-gradient-to-r from-mindfire-text-red to-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold'>
              {PACKAGE_CARD_LABELS.monorepoLabel}
            </span>
          )}
        </div>

        {/* Download statistics section */}
        <div className='flex flex-col items-end'>
          <div className='flex flex-row items-center space-x-1'>
            <Image
              src='/images/bxs-download.svg'
              height={18}
              width={18}
              alt='downloads'
              loading='lazy'
              quality={75}
              aria-hidden='true'
            />
            <h6 className='text-mindfire-text-black font-semibold text-lg'>
              {new Intl.NumberFormat("en-US").format(group.totalDownloads)}
            </h6>
          </div>
          <p className='text-gray-500 text-xs mt-1 text-right'>
            {PACKAGE_CARD_LABELS.totalDownloads}
          </p>
        </div>
      </div>

      {/* Footer section containing action buttons */}
      <div className='flex flex-row items-center justify-between mt-auto'>
        {!group.isMonorepo && (
          <button
            className='font-bold px-2 py-1 rounded inline-flex items-center hover:bg-gray-100 transition-colors'
            onClick={onFilterClick}
            title={PACKAGE_CARD_LABELS.filterTitle}
            aria-label={PACKAGE_CARD_LABELS.filterTitle}
          >
            <Image
              src='/images/social-media/bx-filter-alt.svg'
              height={20}
              width={20}
              alt='filter'
              loading='lazy'
              quality={75}
              aria-hidden='true'
            />
          </button>
        )}
        {group.isMonorepo && (
          <button
            onClick={onViewAllClick}
            className='flex-1 mr-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2'
            aria-label={`View all packages in ${group.baseTitle}`}
          >
            {PACKAGE_CARD_LABELS.viewAllPackages}
            <svg
              className='w-4 h-4'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>
        )}
        <div className='flex flex-row items-center space-x-2 ml-auto'>
          {/* Package registry link (only for single package groups) */}
          {!group.isMonorepo && group.packages[0]?.url && (
            <Link
              href={group.packages[0].url}
              target='_blank'
              title={PACKAGE_CARD_LABELS.viewPackageTitle}
            >
              <Image
                src={
                  group.packages[0].type?.toLowerCase() === "pypi"
                    ? "/images/social-media/pypi-svg.svg"
                    : group.packages[0].type === "Nuget"
                      ? "/images/social-media/nuget-svgrepo-com.png"
                      : "/images/social-media/npm-svgrepo-com.svg"
                }
                height={35}
                width={35}
                alt='package'
                loading='lazy'
                quality={75}
              />
            </Link>
          )}

          {/* GitHub repository link */}
          <Link
            href={`${GITHUB_BASE_URL}/${group.githubRepo}`}
            target='_blank'
            title={PACKAGE_CARD_LABELS.githubTitle}
          >
            <Image
              src='/images/bxl-github.svg'
              height={30}
              width={30}
              alt='github'
              loading='lazy'
              quality={75}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
