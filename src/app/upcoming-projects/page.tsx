import Image from "next/image";
import Link from "next/link";
import ProjectGrid from "../projects/components/ProjectGrid";
import upcomingProjectData from "@/asset/upcomingProjects.json";
import { PROJECTS_HERO } from "@/constants";

export default function ProjectsPage() {
  return (
    <>
      {/* Hero section introducing the projects page */}
      <section className='bg-slate-50'>
        <div className='flex flex-col lg:flex-row justify-between lg:p-6 lg:px-10'>
          {/* Left section containing heading, description, and CTA */}
          <div className='px-8 lg:basis-2/5 py-16 lg:pl-0'>
            <h1 className='text-4xl leading-10 md:text-5xl max-w-lg md:!leading-[3.5rem] tracking-wide text-mindfire-text-black'>
              {PROJECTS_HERO.heading}
            </h1>

            {/* Subheading describing the projects */}
            <p className='mt-6 text-xl text-mf-light-grey tracking-wide'>
              {PROJECTS_HERO.subheading}
            </p>

            {/* Call-to-action button that scrolls to upcoming projects section */}
            <div className='flex flex-wrap items-start gap-6 mt-10'>
              <Link
                href='#upcoming-projects'
                className='bg-mf-red text-center text-white tracking-widest capitalize rounded-full px-8 py-3'
              >
                {PROJECTS_HERO.ctaLabel}
              </Link>
            </div>
          </div>

          {/* Right section hero illustration */}
          <Image
            src='/images/projects.webp'
            alt='group-of-people-gathered-around-wooden-table'
            className='max-lg:w-full object-contain'
            height='500'
            width='600'
            priority // Ensures the hero image loads early for better UX
          />
        </div>
      </section>

      {/* Upcoming projects section displaying project grid */}
      <div id='upcoming-projects' className='mb-20'>
        <ProjectGrid
          title='Upcoming Projects'
          projectData={upcomingProjectData}
        />
      </div>
    </>
  );
}
