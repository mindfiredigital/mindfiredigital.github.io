import React from "react";
import projectData from "../assets/projects.json";
import ProjectCard from "./ProjectCard";
import ProjectFilteration from "./ProjectFilteration";

interface ProjectFilteration {
  languages: string[];
}
interface ProjectGridProps {
  filterParams: ProjectFilteration;
}

export default function ProjectGrid({ filterParams }: ProjectGridProps) {
  let filteredProjects = projectData;
  if (filterParams.languages.length > 0) {
    filteredProjects = projectData.filter(({ languages }) => {
      return filterParams.languages.some((language) =>
        languages.includes(language)
      );
    });
  }
  return (
    <section className="py-28 mb-28" id="all-projects">
      <ProjectFilteration />
      <h2 className="tracking-wider text-3xl font-medium capitalize text-mindfire-text-black  text-center">
        all Projects
      </h2>
      <div className="mt-12 px-4 grid gap-6 max-w-6xl mx-auto md:grid-cols-2 lg:grid-cols-3">
        {projectData.map(
          ({ title, shortDescription, githubUrl, documentationUrl }, index) => {
            return (
              <ProjectCard
                key={index}
                title={title}
                shortDescription={shortDescription}
                githubUrl={githubUrl}
                documentationUrl={documentationUrl}
              />
            );
          }
        )}
      </div>
    </section>
  );
}
