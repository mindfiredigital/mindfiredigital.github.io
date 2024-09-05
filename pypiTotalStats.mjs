import axios from "axios";
import * as cheerio from "cheerio";

export async function fetchTotalDownloads(packageName) {
  const url = `https://www.pepy.tech/projects/${packageName}`;

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const totalDownloadsText = $(
      '.MuiPaper-root[data-cy="summary"] .MuiGrid-item:nth-of-type(4)'
    )
      .text()
      .trim();
    const totalDownloads = parseInt(
      totalDownloadsText.replace(/[^\d]/g, ""),
      10
    );
    return totalDownloads || 0;
  } catch (error) {
    console.error(`Error fetching data for ${packageName}:`, error);
    return 0;
  }
}
