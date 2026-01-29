export interface PackageCountProps {
  totalPackages: number;
}

export type Package = {
  name: string;
  title: string;
  type: "npm" | "pypi" | "Nuget";
  day?: number;
  week?: number;
  year?: number;
  total?: number;
  last_day?: number;
  last_week?: number;
  last_month?: number;
  url: string;
  status: string;
};

export type NpmStats = {
  downloads: { downloads: number; day: string }[];
};

export type GroupedPackage = {
  id: string;
  baseTitle: string;
  isMonorepo: boolean;
  githubRepo: string;
  packages: Package[];
  totalDownloads: number;
  type: "npm" | "pypi" | "Nuget";
};

// NEW: Type for projects_grouped.json structure
export type ProjectGroupedData = {
  id: string;
  title: string;
  isMonoRepo: boolean;
  repoUrl?: string;
  packages: {
    name: string;
    title?: string;
    type: string;
    url: string;
    status: "published" | "draft";
  }[];
};
