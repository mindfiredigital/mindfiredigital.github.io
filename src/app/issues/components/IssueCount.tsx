"use client";

import Image from "next/image";
import { BorderBeam } from "@/components/shared/BorderBeam";
import { useAnimatedCounter } from "@/hooks";

const IssueCount = ({ totalIssues }: { totalIssues: number }) => {
  const count = useAnimatedCounter(totalIssues);

  return (
    <div className='relative rounded-full'>
      <div className='relative flex items-center gap-2 bg-white/90 border border-gray-200 backdrop-blur-sm rounded-full shadow-md shadow-red-300 py-2 px-4 hover:shadow-xl transition-shadow duration-300'>
        <span className='text-3xl font-bold bg-gradient-to-r from-mindfire-text-red to-orange-500 bg-clip-text text-transparent'>
          {count}
        </span>
        <Image
          src='/images/social-media/git-issue.svg'
          height={30}
          width={30}
          loading='lazy'
          alt='total_issues'
          className='rounded-3xl animate-bounce'
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

export default IssueCount;
