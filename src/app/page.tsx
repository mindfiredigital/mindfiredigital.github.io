import React from "react";
import TypeAnimationWrapper from "@/components/shared/TypeAnimationWrapper";
import Link from "next/link";
import { HOME } from "@/constants";

export default function Home() {
  return (
    // Main hero section container with responsive layout
    <div className='flex flex-col-reverse items-center lg:flex-row justify-between px-6 pr-12 py-12'>
      {/* Left section: Heading, subheading and CTA */}
      <div className='max-w-2xl mt-7'>
        {/* Main heading with animated text */}
        <div className='text-mf-dark font-bold text-3xl tracking-wider leading-10'>
          {HOME.heading} |{" "}
          {/* Typing animation cycling through provided text sequence */}
          <TypeAnimationWrapper sequence={[HOME.foss, HOME.TWO_THOUSAND, ""]} />
        </div>

        {/* Subheading / description text */}
        <div className='text-mf-light-grey text-lg leading-6 mt-4 mb-10'>
          {HOME.subheading}
        </div>

        {/* Call-to-action button linking to projects page */}
        <Link href='/projects' className='btn-mf-primary text-base'>
          {HOME.explore_project}
        </Link>
      </div>

      {/* Right section: Animated illustration */}
      <video
        autoPlay
        loop
        muted
        playsInline
        width={410}
        height={410}
        style={{ width: 410, height: 410 }}
      >
        <source src='/images/particle_animation.webm' type='video/webm' />
        <source src='/images/particle_animation.mp4' type='video/mp4' />
      </video>
    </div>
  );
}
