"use client";

import Image from "next/image";
import npm from "../../../../public/images/social-media/package.svg";
import { BorderBeam } from "../../../components/shared/BorderBeam";
import { PackageCountProps } from "@/types";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

const PackageCount = ({ totalPackages }: PackageCountProps) => {
  const count = useAnimatedCounter(totalPackages);

  return (
    <div className='relative rounded-full'>
      <div className='relative flex items-center gap-2 bg-white/90 border border-gray-200 backdrop-blur-sm rounded-full shadow-md shadow-red-300 py-2 px-4 hover:shadow-xl transition-shadow duration-300'>
        <span className='text-3xl font-bold bg-gradient-to-r from-mindfire-text-red to-orange-500 bg-clip-text text-transparent'>
          {count}
        </span>
        <Image
          src={npm}
          height={30}
          width={30}
          loading='lazy'
          alt='total_packages'
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

export default PackageCount;
