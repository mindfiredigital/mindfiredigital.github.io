import React from "react";
import type { Metadata } from "next";
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
import aboutUs from "../../../public/images/about-us.webp";
import meta from "../../metadata/metadata.json";

export const metadata: Metadata = {
  title: meta["About"].title,
  description: meta["About"].description,

  openGraph: {
    title: meta["About"].title,
    description: meta["About"].description,
    images: {
      url: meta["About"].openGraph.images,
      height: "627",
      width: "1200",
    },
    url: meta["About"].openGraph.url,
    type: "website",
    siteName: "Mindfire Digital LLP",
    locale: "en_US",
  },
  twitter: {
    card: "app",
    title: meta["About"].title,
    description: meta["About"].description,
    site: "@mindfires",
    creator: "@mindfires",
    app: {
      name: "twitter_app",
      id: {
        iphone: "twitter_app://iphone",
        ipad: "twitter_app://ipad",
        googleplay: "twitter_app://googleplay",
      },
    },
  },
};

const About = () => {
  return (
    <>
      <section className='bg-slate-50'>
        <div className='flex flex-col lg:flex-row justify-between lg:p-6 lg:px-10'>
          <div className='px-8 lg:basis-2/5 py-16 lg:pl-0'>
            <h1 className='text-4xl leading-10 md:text-5xl max-w-lg md:!leading-[3.5rem] tracking-wide text-mindfire-text-black'>
              {ABOUT_HERO.heading}
            </h1>
            <p className='mt-6 text-xl text-mf-light-grey tracking-wide'>
              {ABOUT_HERO.subheading}
            </p>
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
          <Image
            src={aboutUs}
            alt='women-standing-beside-corkboard'
            className='max-lg:w-full object-contain'
            height='500'
            width='600'
            priority
          />
        </div>
      </section>
      <AboutSegmentSection
        title={ABOUT_MISSION.title}
        description={ABOUT_MISSION.description}
        data={MISSION_SECTION_DATA}
      />
      <AboutSegmentSection
        title={ABOUT_WHY_OPEN_SOURCE.title}
        description={ABOUT_WHY_OPEN_SOURCE.description}
        data={WHY_OPEN_SOURCE_SECTION_DATA}
        className='mt-28'
      />
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
