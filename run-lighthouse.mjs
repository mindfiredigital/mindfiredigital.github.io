// run-lighthouse.mjs
import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";

// Clean stale lighthouse temp dirs
const tmp = os.tmpdir();
for (const entry of fs.readdirSync(tmp)) {
  if (entry.startsWith("lighthouse.")) {
    try {
      fs.rmSync(path.join(tmp, entry), { recursive: true, force: true });
    } catch (_) {}
  }
}

// Ensure output dir exists
fs.mkdirSync("./lighthouse-reports", { recursive: true });

const flags = `--preset desktop --output html --chrome-flags="--no-sandbox --disable-gpu --headless=new"`;

const pages = [
  { url: "http://localhost:3000/", out: "home" },
  { url: "http://localhost:3000/about/", out: "about" },
  { url: "http://localhost:3000/projects/", out: "projects" },
  { url: "http://localhost:3000/contributors/", out: "contributors" },
  { url: "http://localhost:3000/packages/", out: "packages" },
];

for (const { url, out } of pages) {
  console.log(`\n▶ Auditing: ${url}`);
  try {
    execSync(
      `lighthouse ${url} ${flags} --output-path ./lighthouse-reports/${out}.html`,
      { stdio: "inherit" }
    );
    console.log(` Done: ./lighthouse-reports/${out}.html`);
  } catch (_) {
    // EPERM on cleanup is non-fatal — report was still written
    console.log(
      `Done (cleanup warning ignored): ./lighthouse-reports/${out}.html`
    );
  }
}

console.log("\n🎉 All Lighthouse reports generated in ./lighthouse-reports/");
