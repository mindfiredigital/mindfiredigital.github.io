import {
  JOIN_US_GETTING_STARTED,
  JOIN_US_HERO,
  joinUsGetStartSectionData,
} from "@/constants";
import Image from "next/image";
import Link from "next/link";
import JoinUsSegmentSection from "./components/JoinUsSegmentSection";

const JoinUs = () => {
  return (
    <>
      {/* Hero section of the Join Us page */}
      <section className='bg-slate-50'>
        <div className='flex flex-col lg:flex-row justify-between lg:p-6 lg:px-10'>
          {/* Left side content: heading, description and CTA */}
          <div className='px-8 lg:basis-2/5 py-16 lg:pl-0'>
            {/* Main heading */}
            <h1 className='text-4xl leading-10 md:text-5xl max-w-lg md:!leading-[3.5rem] tracking-wide text-mindfire-text-black'>
              {JOIN_US_HERO.heading}
            </h1>

            {/* Subheading text */}
            <p className='mt-6 text-xl text-mf-light-grey tracking-wide'>
              {JOIN_US_HERO.subheading}
            </p>

            {/* Call-to-action button */}
            <div className='flex flex-wrap items-start gap-6 mt-10'>
              <Link
                href='/projects'
                className='bg-mf-red text-center text-white tracking-widest capitalize rounded-full px-8 py-3'
              >
                {JOIN_US_HERO.ctaLabel}
              </Link>
            </div>
          </div>

          {/* Hero image for Join Us section */}
          <Image
            src='/images/join-us.webp'
            alt={JOIN_US_HERO.imageAlt}
            className='max-lg:w-full object-contain'
            height='500'
            width='600'
            priority
          />
        </div>
      </section>

      {/* Section showing steps or segments for getting started */}
      <JoinUsSegmentSection
        title={JOIN_US_GETTING_STARTED.title}
        description={JOIN_US_GETTING_STARTED.description}
        data={joinUsGetStartSectionData}
        className='mb-24'
      />
    </>
  );
};

export default JoinUs;
