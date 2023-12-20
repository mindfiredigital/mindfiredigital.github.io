import React from "react";
import ProjectCard from "./ProjectCard";

interface Props {
  title: string;
  projectData: Project[];
}

export default function ProjectGrid({ title, projectData }: Props) {
  return (
    <section className='mt-20' id='all-projects'>
      <h2 className='tracking-wider text-3xl font-medium capitalize text-mindfire-text-black  text-center'>
        {title}
      </h2>
      <div className='mt-12 px-4 grid gap-6 max-w-6xl mx-auto md:grid-cols-2 lg:grid-cols-3'>
        {projectData.map(
          ({
            title,
            short_description,
            github_repository_link,
            documentation_link,
            id,
          }) => {
            return (
              <ProjectCard
                key={id}
                title={title}
                shortDescription={short_description}
                githubUrl={github_repository_link}
                documentationUrl={documentation_link}
              />
            );
          }
        )}
      </div>
    </section>
  );
}
