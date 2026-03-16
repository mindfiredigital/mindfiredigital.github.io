import React from "react";
import TypeAnimationWrapper from "@/components/shared/TypeAnimationWrapper";
import Image from "next/image";
import particleAnimation from "../../public/images/particle_animation_optimised.gif";
import Link from "next/link";
import { HOME } from "@/constants";

export default function Home() {
  return (
    <div className='flex flex-col-reverse items-center lg:flex-row justify-between px-6 pr-12 py-12'>
      <div className='max-w-2xl mt-7'>
        <div className='text-mf-dark font-bold text-3xl tracking-wider leading-10'>
          {HOME.heading} |{" "}
          <TypeAnimationWrapper sequence={[HOME.foss, HOME.TWO_THOUSAND, ""]} />
        </div>
        <div className='text-mf-light-grey text-lg leading-6 mt-4 mb-10'>
          {HOME.subheading}
        </div>
        <Link
          href='/projects'
          className='text-white bg-mf-red font-medium text-base rounded-full px-6 py-3 text-center tracking-wide'
        >
          {HOME.explore_project}
        </Link>
      </div>
      <Image
        src={particleAnimation}
        height='410'
        width='410'
        alt='particle_animation'
        priority
      />
    </div>
  );
}
