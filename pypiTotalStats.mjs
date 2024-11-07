import axios from "axios";

export async function fetchTotalDownloads(packageName) {
  const url = `https://pypistats.org/api/packages/${packageName}/overall`;

  try {
    const { data } = await axios.get(url);
    // Sum total downloads from all platforms (overall)
    const totalDownloads = data.data.reduce(
      (sum, entry) => sum + entry.downloads,
      0
    );
    return totalDownloads;
  } catch (error) {
    console.error(`Error fetching download data for ${packageName}:`, error);
    return 0;
  }
}
