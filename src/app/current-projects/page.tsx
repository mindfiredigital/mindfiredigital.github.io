import React from "react";
import Image from "next/image";
import Link from "next/link";
import ProjectGrid from "../projects/components/ProjectGrid";
import projectData from "@/asset/projects.json";
import { PROJECT_PAGE } from "@/constants";

export default function ProjectsPage() {
  return (
    <>
      {/*
       * Hero Section
       * Full-width banner with heading, subheading, and a CTA
       * that smooth-scrolls down to the project grid.
       */}
      <section className='bg-slate-50'>
        <div className='flex flex-col lg:flex-row justify-between lg:p-6 lg:px-10'>
          <div className='px-8 lg:basis-2/5 py-16 lg:pl-0'>
            <h1 className='text-4xl leading-10 md:text-5xl max-w-lg md:!leading-[3.5rem] tracking-wide text-mindfire-text-black'>
              {PROJECT_PAGE.INSPIRING_TITLE}
            </h1>
            <p className='mt-6 text-xl text-mf-light-grey tracking-wide'>
              {PROJECT_PAGE.HARNESS_POTENTIAL}
            </p>
            <div className='flex flex-wrap items-start gap-6 mt-10'>
              <Link
                href='#current-projects'
                className='bg-mf-red text-center text-white tracking-widest capitalize rounded-full px-8 py-3'
              >
                {PROJECT_PAGE.FIND_PROJECT}
              </Link>
            </div>
          </div>
          <Image
            src='/images/projects.webp'
            alt='group-of-people-gathered-around-wooden-table'
            className='max-lg:w-full object-contain'
            height='500'
            width='600'
            priority
          />
        </div>
      </section>
      {/*
       * Project Grid
       * Renders all current projects sorted by stars (handled inside ProjectGrid).
       * The section id is used as the scroll target for the CTA above.
       */}
      <div id='current-projects' className='mb-20'>
        <ProjectGrid title='Current Projects' projectData={projectData} />
      </div>
    </>
  );
}
