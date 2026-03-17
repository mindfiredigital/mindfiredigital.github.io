import ProjectCard from "./ProjectCard";
import ProjectCount from "./ProjectCount";
import { UPCOMING_PROJECTS } from "@/constants";
import { UpcomingProjectsSectionProps } from "@/types";

// Section component responsible for displaying the list of upcoming projects
export default function UpcomingProjectsSection({
  projects,
}: UpcomingProjectsSectionProps) {
  return (
    <>
      <div id='upcoming-projects' className='mt-16 mb-8'>
        <div className='flex justify-center items-center gap-4'>
          <h2 className='text-2xl font-semibold tracking-wide text-mindfire-text-black'>
            {UPCOMING_PROJECTS.heading}
          </h2>
          <ProjectCount totalProjects={projects.length} />
        </div>
      </div>

      {/* If no projects are available, show empty state message */}
      {projects.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-lg text-gray-500'>
            {UPCOMING_PROJECTS.emptyMessage}
          </p>
        </div>
      ) : (
        /* Grid layout displaying project cards */
        <div className='grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              parentTitle='Upcoming Projects'
              shortDescription={project.short_description}
              githubUrl={project.github_repository_link}
              documentationUrl={project.documentation_link}
              stars={project.stars || 0}
              tags={project.tags || []}
            />
          ))}
        </div>
      )}
    </>
  );
}
