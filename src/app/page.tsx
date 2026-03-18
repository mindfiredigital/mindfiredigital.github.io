import React from "react";
import TypeAnimationWrapper from "@/components/shared/TypeAnimationWrapper"; // Custom component for typing animation effect
import Image from "next/image"; // Next.js optimized image component
import Link from "next/link"; // Next.js client-side navigation
import { HOME } from "@/constants"; // Centralized text/content constants

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
        <Link
          href='/projects'
          className='text-white bg-mf-red font-medium text-base rounded-full px-6 py-3 text-center tracking-wide'
        >
          {HOME.explore_project}
        </Link>
      </div>

      {/* Right section: Animated illustration */}
      <Image
        src='/images/particle_animation_optimised.gif'
        height='410'
        width='410'
        alt='particle_animation'
        priority // Ensures this hero image loads immediately for better UX
      />
    </div>
  );
}
