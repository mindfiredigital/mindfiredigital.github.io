"use client";

import Image from "next/image";
import github from "../../../../public/images/social-media/gitprofile.png";
import { BorderBeam } from "../../../components/shared/BorderBeam";
import { ContributorCountProps } from "@/types";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

const ContributorCount = ({ totalContributors }: ContributorCountProps) => {
  const count = useAnimatedCounter(totalContributors);

  return (
    <div className='relative rounded-full'>
      {/* Actual content */}
      <div className='relative flex items-center gap-2 bg-white/90 border border-gray-200 backdrop-blur-sm rounded-full shadow-md shadow-red-300 py-2 px-4 hover:shadow-xl transition-shadow duration-300'>
        <span className='text-3xl font-bold bg-gradient-to-r from-mindfire-text-red to-orange-500 bg-clip-text text-transparent'>
          {count}
        </span>

        <Image
          src={github}
          height={20}
          width={20}
          alt='github_contributors'
          loading='lazy'
          className='animate-bounce mb-[7px]'
        />
      </div>
      <BorderBeam
        duration={4}
        size={70}
        className='from-transparent via-mindfire-text-red to-orange-500'
      />
    </div>
  );
};

export default ContributorCount;
