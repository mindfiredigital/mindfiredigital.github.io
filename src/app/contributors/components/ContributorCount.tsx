"use client";

import Image from "next/image";
import { BorderBeam } from "@/components/shared/BorderBeam";
import { ContributorCountProps } from "@/types";
import { useAnimatedCounter } from "@/hooks";

const ContributorCount = ({ totalContributors }: ContributorCountProps) => {
  /* Animate contributor count */
  const count = useAnimatedCounter(totalContributors);

  return (
    <div className='relative rounded-full'>
      {/* Main badge — shadow-mf-red replaces shadow-md shadow-red-300 */}
      <div className='relative flex items-center gap-2 bg-white/90 border border-mf-border-soft backdrop-blur-sm rounded-full shadow-mf-red py-2 px-4 hover:shadow-xl transition-shadow duration-300'>
        {/* Animated count — text-mf-gradient replaces inline gradient */}
        <span className='text-mf-gradient text-3xl font-bold'>{count}</span>

        {/* GitHub icon */}
        <Image
          src='/images/social-media/gitprofile.png'
          height={20}
          width={20}
          alt='github_contributors'
          loading='lazy'
          className='animate-bounce mb-[7px]'
        />
      </div>

      {/* Decorative border beam effect — uses mf-red token */}
      <BorderBeam
        duration={4}
        size={70}
        className='from-transparent via-mf-red to-orange-500'
      />
    </div>
  );
};

export default ContributorCount;
