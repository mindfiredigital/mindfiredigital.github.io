import axios from "axios";

export async function fetchTotalDownloads(packageName) {
  const url = `https://pepy.tech/badge/${packageName}`;

  try {
    const response = await axios.get(url, {
      headers: {
        // This is the "Magic" line that stops the server from blocking you
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    const svg = response.data;

    // Use a case-insensitive regex that allows for optional whitespace (\s*)
    const match = svg.match(
      /Downloads<\/text>\s*<text[^>]*>([\d,.kMB]+)<\/text>/i
    );

    if (match) {
      let downloadsStr = match[1];
      let multiplier = 1;

      if (downloadsStr.toLowerCase().includes("k")) multiplier = 1000;
      else if (downloadsStr.toLowerCase().includes("m")) multiplier = 1000000;
      else if (downloadsStr.toLowerCase().includes("b"))
        multiplier = 1000000000;

      const numericValue = parseFloat(downloadsStr.replace(/[kMB,]/gi, ""));
      return Math.round(numericValue * multiplier);
    }

    console.warn(`Pattern not found in SVG for ${packageName}`);
    return 0;
  } catch (error) {
    // Log the actual status code to see if you're being blocked (403)
    console.error(
      `❌ Error for ${packageName}:`,
      error.response?.status || error.message
    );
    return 0;
  }
}
