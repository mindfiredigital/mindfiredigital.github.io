"use client";

import ContributorCard from "./ContributorCard";
import { ContributorListSectionProps } from "@/types";
import { CONTRIBUTORS_LIST } from "@/constants";

export default function ContributorListSection({
  filteredAndSorted,
  totalCount,
  onViewDetails,
  onReset,
  sectionRef,
}: ContributorListSectionProps) {
  return (
    <div ref={sectionRef} className='mt-12 pb-16 px-6'>
      {/* Section heading + "X of Y" filter count badge */}
      <div className='flex items-center justify-center gap-4 mb-8'>
        <h2 className='text-3xl font-medium text-mf-dark'>
          {CONTRIBUTORS_LIST.heading}
        </h2>
        {/* mindfire-text-red → mf-red, border-gray-200 → border-mf-border-soft */}
        <span className='bg-white border border-mf-border-soft rounded-full px-4 py-1 text-sm font-semibold text-mf-red shadow-sm'>
          {filteredAndSorted.length} of {totalCount}
        </span>
      </div>

      {filteredAndSorted.length > 0 ? (
        <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {filteredAndSorted.map((contributor, index) => (
            <ContributorCard
              key={contributor.id}
              contributor={contributor}
              displayRank={index + 1}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className='flex flex-col justify-center items-center h-64 gap-3'>
          <p className='text-xl text-mf-light-grey tracking-wide'>
            {CONTRIBUTORS_LIST.emptyMessage}
          </p>
          <button
            onClick={onReset}
            className='text-sm text-mf-red hover:underline font-medium'
          >
            {CONTRIBUTORS_LIST.clearFiltersLabel}
          </button>
        </div>
      )}
    </div>
  );
}
