"use client";

import React from "react";
import ContributorCount from "./ContributorCount";
import TopContributors from "./TopContributors";
import ScoringSystem from "./ScoringSystem";
import { ContributorHeroProps } from "@/types";
import { CONTRIBUTORS_HERO } from "@/constants";

export default function ContributorHero({
  contributorsArray,
  topScorers,
}: ContributorHeroProps) {
  return (
    <div className='flex flex-col items-center text-center pt-10 px-6'>
      {/* Page heading + animated contributor count badge */}
      <div className='flex items-center justify-center gap-4'>
        {/* mindfire-text-black → mf-dark */}
        <h1 className='text-4xl leading-10 md:text-5xl md:!leading-[3.5rem] tracking-wide text-mf-dark'>
          {CONTRIBUTORS_HERO.heading}
        </h1>
        <ContributorCount totalContributors={topScorers.length} />
      </div>

      {/* Top contributors subheading */}
      <div className='mt-6'>
        <h2 className='text-2xl font-medium text-mf-dark mb-3'>
          {CONTRIBUTORS_HERO.topContributorsHeading}
        </h2>
        <p className='text-xl text-mf-light-grey tracking-wide'>
          {CONTRIBUTORS_HERO.topContributorsSubheading}
        </p>
      </div>

      {/* Rotating carousel of top contributors grouped by activity / PRs / commits */}
      <div className='mt-8 w-full flex justify-center'>
        <TopContributors
          contributors={contributorsArray}
          topScorers={topScorers}
        />
      </div>

      {/* Collapsible scoring formula accordion */}
      <div className='mt-4 pb-2 w-full max-w-3xl'>
        <ScoringSystem />
      </div>
    </div>
  );
}
