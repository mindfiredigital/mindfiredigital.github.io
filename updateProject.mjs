// updateProjects.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to fetch data from an API endpoint
async function fetchData(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed with status: ${response.status}`);
  }
  return await response.json();
}

// Function to fetch collaborators from GitHub
async function fetchCollaborators(url, githubToken) {
  const options = {
    headers: {
      Authorization: `token ${githubToken}`,
      Accept: "application/vnd.github.v3+json",
    },
  };
  return await fetchData(url, options);
}

// Function to get collaborators of a repository
async function getCollaborators(repoData, githubToken) {
  if (repoData.fork && repoData.parent?.contributors_url) {
    // If the repository is a fork and has a parent, fetch collaborators from both
    const [c1, c2] = await Promise.all([
      fetchCollaborators(repoData.contributors_url, githubToken),
      fetchCollaborators(repoData.parent.contributors_url, githubToken),
    ]);
    // Filter out collaborators from the repository who are also in the parent
    return c1.filter(
      (collab1) => !c2.some((collab2) => collab1.login === collab2.login)
    );
  }
  // Otherwise, fetch collaborators directly from the repository
  return fetchCollaborators(repoData.contributors_url, githubToken);
}

// Main function to update projects data
async function updateProjects() {
  const githubToken = process.env.GITHUB_TOKEN;

  try {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    // Fetch data for current projects and upcoming projects
    const [currentProjectsData, upcomingProjectsData, repositories] =
      await Promise.all([
        // Fetch current projects data
        fetchData("https://directus.ourgoalplan.co.in/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query getCurrentProjects {
            foss_projects(filter: {project_type: { _eq: "current" }}) {
              id,
              title,
              short_description,
              github_repository_link,
              documentation_link,
              project_type,
              date_created,
              date_updated,
              status,
            }
          }`,
          }),
        }),
        // Fetch upcoming projects data
        fetchData("https://directus.ourgoalplan.co.in/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query getUpcomingProjects {
            foss_projects(filter: {project_type: { _eq: "upcoming" }}) {
              id,
              title,
              short_description,
              github_repository_link,
              documentation_link,
              project_type,
              date_created,
              date_updated,
              status,
            }
          }`,
          }),
        }),
        // Fetch repositories data from GitHub
        fetchData("https://api.github.com/users/mindfiredigital/repos", {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }),
      ]);

    // Process and write data for current projects
    const currentProjects = currentProjectsData.data.foss_projects.map(
      (entry) => ({
        ...entry,
        id: parseInt(entry.id),
        shortDescription: entry.short_description,
        githubUrl: entry.github_repository_link,
        documentationUrl: entry.documentation_link,
      })
    );
    fs.writeFileSync(
      path.join(__dirname, "src/app/projects/assets/projects.json"),
      JSON.stringify(currentProjects, null, 2)
    );
    console.log("Current projects updated successfully.");

    // Process and write data for upcoming projects
    const upcomingProjects = upcomingProjectsData.data.foss_projects.map(
      (entry) => ({
        ...entry,
        id: parseInt(entry.id),
        shortDescription: entry.short_description,
        githubUrl: entry.github_repository_link,
        documentationUrl: entry.documentation_link,
      })
    );
    fs.writeFileSync(
      path.join(__dirname, "src/app/projects/assets/upcomingProjects.json"),
      JSON.stringify(upcomingProjects, null, 2)
    );
    console.log("Upcoming projects updated successfully.");

    // Fetch and process contributors data for repositories
    const repoNames = repositories.map((repo) => repo.name);
    const contributorsObject = {};
    for (const repoName of repoNames) {
      const repoData = await fetchData(
        `https://api.github.com/repos/mindfiredigital/${repoName}`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      contributorsObject[repoName] = await getCollaborators(
        repoData,
        githubToken
      );
    }

    // Aggregate contributor from contributors
    const contributionsMap = {};

    for (const repo in contributorsObject) {
      if (contributorsObject.hasOwnProperty(repo)) {
        contributorsObject[repo].forEach((contributor) => {
          if (contributor.login === "github-actions[bot]") {
            // Skip processing GitHub Actions bot contributions
            return;
          }
          const { login, contributions, id, avatar_url, html_url } =
            contributor;
          // Update contributions map
          contributionsMap[login] = {
            id,
            contributions:
              (contributionsMap[login]?.contributions || 0) + contributions,
            html_url,
            avatar_url,
            login,
          };
        });
      }
    }

    // Sort contributions and write data to file
    const sortedContributions = Object.values(contributionsMap).sort(
      (a, b) => b.contributions - a.contributions
    );
    fs.writeFileSync(
      path.join(__dirname, "src/app/projects/assets/contributors.json"),
      JSON.stringify(sortedContributions, null, 2)
    );
    console.log("Contributors list updated successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Call the main function
updateProjects();
