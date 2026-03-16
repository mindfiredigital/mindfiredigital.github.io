import ProjectCard from "./ProjectCard";
import { CURRENT_PROJECTS } from "@/constants";
import { CurrentProjectsSectionProps } from "@/types";

/* Section component that displays the list of current projects */
export default function CurrentProjectsSection({
  projects,
}: CurrentProjectsSectionProps) {
  return (
    <div className='mb-16'>
      {/* Show empty state message when no projects are available */}
      {projects.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-lg text-gray-500'>
            {CURRENT_PROJECTS.emptyMessage}
          </p>
        </div>
      ) : (
        /* Grid layout displaying project cards */
        <div className='grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3'>
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              parentTitle='Current Projects'
              shortDescription={project.short_description}
              githubUrl={project.github_repository_link}
              documentationUrl={project.documentation_link}
              stars={project.stars || 0}
              tags={project.tags || []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
