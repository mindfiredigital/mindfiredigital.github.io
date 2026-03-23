import React from "react";
import TypeAnimationWrapper from "@/components/shared/TypeAnimationWrapper";
import Link from "next/link";
import { HOME } from "@/constants";

export default function Home() {
  return (
    // Main hero section container with responsive layout
    <main id='main-content'>
      {/* Added min-h-[500px] and fetchPriority to prevent layout shift and speed up LCP */}
      <div className='hero-section flex flex-col-reverse items-center lg:flex-row justify-between px-6 pr-12 py-12 min-h-[500px] lg:min-h-[600px]'>
        {/* Left section: Heading, subheading and CTA */}
        <div className='max-w-2xl mt-7'>
          <h1 className='hero-heading text-mf-dark font-bold text-3xl tracking-wider leading-10'>
            {HOME.heading} |{" "}
            <TypeAnimationWrapper
              sequence={[HOME.foss, HOME.TWO_THOUSAND, ""]}
            />
          </h1>
          {/* Subheading / description text */}
          <p className='text-mf-light-grey text-lg leading-6 mt-4 mb-10'>
            {HOME.subheading}
          </p>
          {/* Call-to-action button linking to projects page */}
          <Link href='/projects' className='btn-mf-primary text-base'>
            {HOME.explore_project}
          </Link>
        </div>

        <div className='relative flex-shrink-0 w-[410px] h-[410px]'>
          <video
            autoPlay
            loop
            muted
            playsInline
            width={410}
            height={410}
            className='hero-video'
            preload='auto'
          >
            <source src='/images/particle_animation.webm' type='video/webm' />
            <source src='/images/particle_animation.mp4' type='video/mp4' />
          </video>
        </div>
      </div>
    </main>
  );
}
