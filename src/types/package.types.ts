export interface PackageCountProps {
  totalPackages: number;
}

export type Package = {
  name: string;
  title: string;
  type: "npm" | "pypi";
  day?: number;
  week?: number;
  year?: number;
  total?: number;
  last_day?: number;
  last_week?: number;
  last_month?: number;
};

export type NpmStats = {
  downloads: { downloads: number; day: string }[];
};

export type GroupedPackage = {
  id: string; // unique identifier for the group
  baseTitle: string; // e.g., "Canvas Editor", "Page Builder"
  isMonorepo: boolean;
  githubRepo: string; // repo name for GitHub link
  packages: Package[]; // array of packages in this group
  totalDownloads: number; // combined downloads across all packages
  type: "npm" | "pypi"; // primary type (or mixed if needed)
};
