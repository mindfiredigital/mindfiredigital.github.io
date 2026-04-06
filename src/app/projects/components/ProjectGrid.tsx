import ProjectCard from "./ProjectCard";
import ProjectCount from "./ProjectCount";
import { ProjectGridProps } from "@/types";

/* Displays a grid of projects with a heading and project count */
export default function ProjectGrid({ title, projectData }: ProjectGridProps) {
  /* Sort projects by GitHub stars in descending order */
  const sortedProjects = [...projectData].sort(
    (a, b) => (b.stars ?? 0) - (a.stars ?? 0)
  );

  return (
    <section className='mt-20' id='all-projects'>
      {/* Section header showing title and total project count */}
      <div className='flex justify-center items-center gap-4'>
        <h1 className='text-4xl leading-10 md:text-5xl md:!leading-[3.5rem] tracking-wide text-mindfire-text-black'>
          {title}
        </h1>
        <ProjectCount totalProjects={projectData.length} />
      </div>

      {/* Responsive grid layout rendering project cards */}
      <div className='mt-12 px-8 grid gap-6 max-w-6xl mx-auto md:grid-cols-2 lg:grid-cols-3'>
        {sortedProjects.map(
          (
            {
              title: projectTitle,
              shortDescription,
              githubUrl,
              documentationUrl,
              stars,
              tags,
            },
            index
          ) => {
            return (
              <ProjectCard
                key={index}
                title={projectTitle}
                parentTitle={title}
                shortDescription={shortDescription}
                githubUrl={githubUrl}
                documentationUrl={documentationUrl}
                stars={stars}
                tags={tags}
              />
            );
          }
        )}
      </div>
    </section>
  );
}
