"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import npm from "../../../../public/images/social-media/fire.gif";
import { BorderBeam } from "../../../components/shared/BorderBeam";

interface PackageCountProps {
  totalPackages: number;
}

const PackageCount = ({ totalPackages }: PackageCountProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 800; // 1 second
    const steps = 60;
    const increment = totalPackages / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= totalPackages) {
        setCount(totalPackages);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [totalPackages]);

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
          alt='total_packages'
          className='rounded-3xl'
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
