interface Project {
  id: number;
  date_updated?: string | null;
  title: string;
  short_description: string;
  github_repository_link: string;
  documentation_link: string;
  date_created?: string;
  status?: string;
  project_type: string;
}
