import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import projectsImage from "../../../public/images/projects.webp";
import ProjectGrid from "../projects/components/ProjectGrid";
import meta from "../../metadata/metadata.json";

export const metadata: Metadata = {
  title: meta["Upcoming-Projects"].title,
  description: meta["Upcoming-Projects"].description,

  openGraph: {
    title: meta["Upcoming-Projects"].title,
    description: meta["Upcoming-Projects"].description,
    images: {
      url: meta["Upcoming-Projects"].openGraph.images,
      height: "627",
      width: "1200",
    },
    url: meta["Upcoming-Projects"].openGraph.url,
    type: "website",
    siteName: "Mindfire Digital LLP",
    locale: "en_US",
  },
  twitter: {
    card: "app",
    title: meta["Upcoming-Projects"].title,
    description: meta["Upcoming-Projects"].description,
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

async function getUpcomingProjects() {
  const query = `query getCurrentProjects {
    foss_projects(filter: {project_type: { _eq: "upcoming" }}) {
      id,
      title,
      short_description,
      github_repository_link,
      documentation_link,
      project_type
    }
  }`;

  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const response = await fetch("https://directus.ourgoalplan.co.in/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: query,
      }),
    });

    const { data } = await response.json();

    return data.foss_projects;
  } catch (error) {
    console.log(error);
  }
}

export default async function ProjectsPage() {
  const upcomingProjects: Project[] = await getUpcomingProjects();

  return (
    <>
      <section className='bg-slate-50'>
        <div className='flex flex-col lg:flex-row justify-between lg:p-6 lg:px-10'>
          <div className='px-8 lg:basis-2/5 py-16 lg:pl-0'>
            <h1 className='text-4xl leading-10 md:text-5xl max-w-lg md:!leading-[3.5rem] tracking-wide text-mindfire-text-black'>
              Inspiring Innovation on Your Creative Endeavors.
            </h1>
            <p className='mt-6 text-xl text-mf-light-grey tracking-wide'>
              Harness the potential of your innovative spirit.
            </p>
            <div className='flex flex-wrap items-start gap-6 mt-10'>
              <Link
                href='#upcoming-projects'
                className='bg-mf-red text-center text-white tracking-widest capitalize rounded-full px-8 py-3'
              >
                find projects
              </Link>
            </div>
          </div>
          <Image
            src={projectsImage}
            alt='group-of-people-gathered-around-wooden-table'
            className='max-lg:w-full object-contain'
            height='500'
            width='600'
            priority
          />
        </div>
      </section>
      <div id='upcoming-projects' className='mb-20'>
        <ProjectGrid title='Upcoming Projects' projectData={upcomingProjects} />
      </div>
    </>
  );
}
