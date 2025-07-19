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
