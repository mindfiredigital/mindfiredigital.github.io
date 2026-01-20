import { Package, GroupedPackage } from "@/types";

/**
 * Groups packages by their base repository name
 * Identifies monorepos by detecting multiple packages with similar names
 */
export function groupPackages(packages: Package[]): GroupedPackage[] {
  const groups = new Map<string, Package[]>();

  // Define repo groupings based on naming patterns
  const repoMappings: Record<string, string> = {
    "canvas-editor": "canvas-editor",
    "react-canvas-editor": "canvas-editor",
    "angular-canvas-editor": "canvas-editor",
    "page-builder": "page-builder",
    "page-builder-react": "page-builder",
    "page-builder-web-component": "page-builder",
    textigniterjs: "text-igniter",
    "react-text-igniter": "text-igniter",
  };

  // Group packages by their base repo
  packages.forEach((pkg) => {
    const repoKey = repoMappings[pkg.name] || pkg.name;

    if (!groups.has(repoKey)) {
      groups.set(repoKey, []);
    }
    groups.get(repoKey)!.push(pkg);
  });

  // Convert groups to GroupedPackage array
  const groupedPackages: GroupedPackage[] = Array.from(groups.entries()).map(
    ([repoKey, pkgs]) => {
      const isMonorepo = pkgs.length > 1;
      const totalDownloads = pkgs.reduce(
        (sum, pkg) => sum + (pkg.total || 0),
        0
      );

      // Get base title (remove framework suffixes)
      const baseTitle = getBaseTitle(pkgs[0].title);

      return {
        id: repoKey,
        baseTitle,
        isMonorepo,
        githubRepo: repoKey,
        packages: pkgs,
        totalDownloads,
        type: pkgs[0].type,
      };
    }
  );

  // Sort by total downloads (descending)
  return groupedPackages.sort((a, b) => b.totalDownloads - a.totalDownloads);
}

/**
 * Removes framework-specific suffixes from package titles
 */
function getBaseTitle(title: string): string {
  return title
    .replace(/\s*\(React\)$/i, "")
    .replace(/\s*\(Angular\)$/i, "")
    .replace(/\s*\(Web Component\)$/i, "")
    .replace(/\s*\(Vue\)$/i, "")
    .replace(/\s*JS$/i, "")
    .trim();
}

/**
 * Extracts the framework name from a package title
 */
export function getFrameworkName(title: string): string {
  const match = title.match(/\((.*?)\)/);
  if (match) return match[1];
  if (title.toLowerCase().includes("js")) return "JavaScript";
  return "Core";
}
