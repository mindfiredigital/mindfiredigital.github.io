import React from "react";
import Image from "next/image";
import Link from "next/link";
import AboutSegmentSection from "./components/AboutSegmentSection";
import {
  MISSION_SECTION_DATA,
  WHY_OPEN_SOURCE_SECTION_DATA,
  ABOUT_HERO,
  ABOUT_MISSION,
  ABOUT_WHY_OPEN_SOURCE,
  ABOUT_CONTRIBUTIONS,
} from "@/constants";

/* About page with hero + informational sections */
const About = () => {
  return (
    <>
      {/* Hero section */}
      <section className='bg-slate-50'>
        <div className='flex flex-col lg:flex-row justify-between lg:p-6 lg:px-10'>
          {/* Hero text content */}
          <div className='px-8 lg:basis-2/5 py-16 lg:pl-0'>
            <h1 className='text-4xl leading-10 md:text-5xl max-w-lg md:!leading-[3.5rem] tracking-wide text-mindfire-text-black'>
              {ABOUT_HERO.heading}
            </h1>

            <p className='mt-6 text-xl text-mf-light-grey tracking-wide'>
              {ABOUT_HERO.subheading}
            </p>

            {/* CTA buttons */}
            <div className='flex flex-wrap items-start gap-6 mt-10'>
              <Link
                href='/projects'
                className='bg-mf-red text-center text-white tracking-widest capitalize rounded-full px-8 py-3'
              >
                {ABOUT_HERO.exploreLabel}
              </Link>

              <Link
                target='_blank'
                href={ABOUT_HERO.contactHref}
                className='bg-mf-red text-center text-white tracking-widest capitalize rounded-full px-8 py-3'
              >
                {ABOUT_HERO.contactLabel}
              </Link>
            </div>
          </div>

          {/* Hero image */}
          <Image
            src='/images/about-us.webp'
            alt='women-standing-beside-corkboard'
            className='max-lg:w-full object-contain'
            height='500'
            width='600'
            priority
          />
        </div>
      </section>

      {/* Mission section */}
      <AboutSegmentSection
        title={ABOUT_MISSION.title}
        description={ABOUT_MISSION.description}
        data={MISSION_SECTION_DATA}
      />

      {/* Why open source section */}
      <AboutSegmentSection
        title={ABOUT_WHY_OPEN_SOURCE.title}
        description={ABOUT_WHY_OPEN_SOURCE.description}
        data={WHY_OPEN_SOURCE_SECTION_DATA}
        className='mt-28'
      />

      {/* Contributions CTA section */}
      <AboutSegmentSection
        title={ABOUT_CONTRIBUTIONS.title}
        description={ABOUT_CONTRIBUTIONS.description}
        className='mb-24'
      >
        <div className='text-center'>
          <Link
            href='/projects#all-projects'
            className='bg-mf-red tracking-wider text-white rounded-full px-5 py-3'
          >
            {ABOUT_CONTRIBUTIONS.exploreLabel}
          </Link>
        </div>
      </AboutSegmentSection>
    </>
  );
};

export default About;
