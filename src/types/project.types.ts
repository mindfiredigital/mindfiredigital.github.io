export interface ProjectProps {
  title: string;
  parentTitle: string;
  shortDescription: string;
  githubUrl?: string;
  documentationUrl?: string;
  stars?: number;
  tags?: string[];
}

export interface ProjectCountProps {
  totalProjects: number;
}

export interface ProjectGridProps {
  title: string;
  projectData: {
    title: string;
    shortDescription: string;
    githubUrl?: string | undefined;
    documentationUrl?: string | undefined;
    id?: number | undefined;
    Summary?: string | undefined;
    project_type?: string | undefined;
    contributors?: string[] | undefined;
    project_goal?: string | undefined;
    target_users?: string | undefined;
    risk?: string | undefined;
    stars?: number;
    tags?: string[];
  }[];
}
