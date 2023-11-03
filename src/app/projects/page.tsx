import Image from "next/image";
import Link from "next/link";
import projectsImage from "../../../public/images/projects.webp";
import ProjectGrid from "./components/ProjectGrid";

export default function ProjectsPage({ searchParams }: any) {
  console.log({ searchParams });
  return (
    <>
      <section className="bg-slate-50">
        <div className="flex flex-col lg:flex-row justify-between lg:p-6 lg:px-10">
          <div className="px-8 lg:basis-2/5 py-16 lg:pl-0">
            <h1 className="text-4xl leading-10 md:text-5xl max-w-lg md:!leading-[3.5rem] tracking-wide text-mindfire-text-black">
              Inspiring Innovation on Your Creative Endeavors.
            </h1>
            <p className="mt-6 text-xl text-mf-light-grey tracking-wide">
              Harness the potential of your innovative spirit.
            </p>
            <div className="flex flex-wrap items-start gap-6 mt-10">
              <Link
                href="#all-projects"
                className="bg-mf-red text-center text-white tracking-widest capitalize rounded-full px-8 py-3"
              >
                find projects
              </Link>
            </div>
          </div>
          <Image
            src={projectsImage}
            alt="group-of-people-gathered-around-wooden-table"
            className="max-lg:w-full object-contain"
            height="500"
            width="600"
            priority
          />
        </div>
      </section>
      <ProjectGrid
        filterParams={{
          languages: searchParams?.languages ?? [],
        }}
      />
    </>
  );
}
