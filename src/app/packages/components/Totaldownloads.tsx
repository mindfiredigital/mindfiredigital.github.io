"use client";

import Image from "next/image";
import download from "../../../../public/images/bxs-download.svg";
import { BorderBeam } from "../../../components/shared/BorderBeam";
import { useAnimatedCounter } from "@/hooks/useAnimatedCounter";

interface TotalDownloadsProps {
  totalDownloads: number;
}

const TotalDownloads = ({ totalDownloads }: TotalDownloadsProps) => {
  const count = useAnimatedCounter(totalDownloads);

  const formatted = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count);

  return (
    <div className='relative rounded-full'>
      <div className='relative flex items-center gap-2 bg-white/90 border border-gray-200 backdrop-blur-sm rounded-full shadow-md shadow-orange-200 py-2 px-5 hover:shadow-xl transition-shadow duration-300'>
        <Image
          src={download}
          height={22}
          width={22}
          loading='lazy'
          alt='total_downloads'
          className='opacity-80'
        />
        <span className='text-2xl font-bold bg-gradient-to-r from-mindfire-text-red to-orange-500 bg-clip-text text-transparent'>
          {formatted}
        </span>
        <span className='text-sm font-medium text-gray-500 ml-1'>
          Total Downloads
        </span>
      </div>
      <BorderBeam
        duration={5}
        size={80}
        className='from-transparent via-orange-400 to-mindfire-text-red'
      />
    </div>
  );
};

export default TotalDownloads;
