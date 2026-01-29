import { Package, GroupedPackage, ProjectGroupedData } from "@/types";

/**
 * Groups packages by project using projects_grouped.json structure
 * Matches packages with their download stats from packages.json
 */
export function groupPackages(
  packages: Package[],
  projectsGrouped: ProjectGroupedData[]
): GroupedPackage[] {
  // Create maps for efficient matching
  const packageByName = new Map<string, Package>();
  const packageByUrl = new Map<string, Package>();

  packages.forEach((pkg) => {
    packageByName.set(pkg.name.toLowerCase().trim(), pkg);

    if (pkg.url) {
      packageByUrl.set(pkg.url.toLowerCase().trim(), pkg);
    }
  });

  // Transform projects into grouped packages
  const groupedPackages: GroupedPackage[] = projectsGrouped
    .filter((project) => project.packages && project.packages.length > 0)
    .map((project) => {
      // Match published packages with their stats
      const packagesWithStats = project.packages
        .filter((pkg) => pkg.status === "published")
        .map((pkg) => {
          // Strategy 1: Match by URL (most reliable)
          if (pkg.url) {
            const stats = packageByUrl.get(pkg.url.toLowerCase().trim());
            if (stats) return stats;
          }

          // Strategy 2: Match by name
          const stats = packageByName.get(pkg.name.toLowerCase().trim());
          if (stats) return stats;

          // Strategy 3: Extract package name from URL and match
          if (pkg.url) {
            const extractedName = extractPackageNameFromUrl(pkg.url);
            if (extractedName) {
              const stats = packageByName.get(extractedName.toLowerCase());
              if (stats) return stats;
            }
          }

          return null;
        })
        .filter((pkg): pkg is Package => pkg !== null);

      // Calculate total downloads
      const totalDownloads = packagesWithStats.reduce(
        (sum, pkg) => sum + (pkg.total || 0),
        0
      );

      // Determine if it's a monorepo
      const isMonorepo =
        project.isMonoRepo ||
        project.packages.filter((p) => p.status === "published").length > 1;

      return {
        id: project.id,
        baseTitle: project.title,
        isMonorepo,
        githubRepo: generateGithubRepoName(project.title),
        packages: packagesWithStats,
        totalDownloads,
        type: packagesWithStats[0]?.type || "npm",
      };
    })
    .filter((group) => group.packages.length > 0);

  // Sort by total downloads (descending)
  return groupedPackages.sort((a, b) => b.totalDownloads - a.totalDownloads);
}

/**
 * Extract package name from NPM or PyPI URL
 */
function extractPackageNameFromUrl(url: string): string | null {
  if (!url) return null;

  // NPM: https://www.npmjs.com/package/@mindfiredigital/react-canvas-editor
  const npmMatch = url.match(/\/package\/@mindfiredigital\/(.+?)(?:\/|$)/);
  if (npmMatch) return npmMatch[1];

  // PyPI: https://pypi.org/project/sqlrag/
  const pypiMatch = url.match(/\/project\/(.+?)(?:\/|$)/);
  if (pypiMatch) return pypiMatch[1];

  return null;
}

/**
 * Generates a GitHub repository name from a project title
 */
function generateGithubRepoName(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Extracts the framework name from a package title
 */
export function getFrameworkName(title: string): string {
  const lowerTitle = title.toLowerCase();

  if (lowerTitle.includes("react")) return "React";
  if (lowerTitle.includes("angular")) return "Angular";
  if (lowerTitle.includes("vue")) return "Vue";
  if (
    lowerTitle.includes("web component") ||
    lowerTitle.includes("webcomponent")
  )
    return "Web Component";
  if (lowerTitle.includes("core")) return "Core";
  if (lowerTitle.includes("cli")) return "CLI";
  if (lowerTitle.includes("analytics")) return "Analytics";

  const match = title.match(/\((.*?)\)/);
  if (match) return match[1];

  if (title.toLowerCase().includes("js")) return "JavaScript";

  return "Core";
}
