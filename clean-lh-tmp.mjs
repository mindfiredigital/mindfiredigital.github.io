// clean-lh-tmp.mjs
import fs from "fs";
import os from "os";
import path from "path";

const tmp = os.tmpdir();

for (const entry of fs.readdirSync(tmp)) {
  if (entry.startsWith("lighthouse.")) {
    try {
      fs.rmSync(path.join(tmp, entry), { recursive: true, force: true });
      console.log(`Cleaned: ${entry}`);
    } catch (e) {
      // non-fatal — ignore locked files
    }
  }
}

console.log("Lighthouse temp cleanup done.");
