"use client";

import Image from "next/image";
import { BorderBeam } from "@/components/shared/BorderBeam";
import { PackageCountProps } from "@/types";
import { useAnimatedCounter } from "@/hooks";

/**
 * PackageCount Component
 *
 * Displays the total number of packages with an animated counter.
 * Includes a visual badge with:
 * - Animated numeric counter
 * - Package icon
 * - Decorative animated border effect
 */
const PackageCount = ({ totalPackages }: PackageCountProps) => {
  /**
   * Custom hook that animates the count value
   * from 0 to the provided totalPackages value.
   */
  const count = useAnimatedCounter(totalPackages);

  return (
    /**
     * Wrapper container for positioning the border animation
     */
    <div className='relative rounded-full'>
      {/* Main badge container showing package count and icon */}
      <div className='relative flex items-center gap-2 bg-white/90 border border-gray-200 backdrop-blur-sm rounded-full shadow-md shadow-red-300 py-2 px-4 hover:shadow-xl transition-shadow duration-300'>
        {/* Animated package count with gradient text styling */}
        <span className='text-3xl font-bold bg-gradient-to-r from-mindfire-text-red to-orange-500 bg-clip-text text-transparent'>
          {count}
        </span>

        {/* Package icon with bounce animation */}
        <Image
          src='/images/social-media/package.svg'
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
