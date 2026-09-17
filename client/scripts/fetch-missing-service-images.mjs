/**
 * Downloads stock photos into client/public/images/services ONLY when a file does not exist.
 * Requires PEXELS_API_KEY (free at https://www.pexels.com/api/).
 * Never overwrites existing files.
 *
 * Run from client folder:  PEXELS_API_KEY=your_key npm run fetch-service-images
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "../public/images/services");
const KEY = process.env.PEXELS_API_KEY;

const JOBS = [
  { file: "hd-bridal-makeup.jpg", query: "bridal makeup hd portrait" },
  { file: "matte-bridal-makeup.jpg", query: "bridal makeup elegant" },
  { file: "soft-glam-bridal-makeup.jpg", query: "soft glam makeup" },
  { file: "traditional-bridal-makeup.jpg", query: "traditional bridal makeup" },
  { file: "hair-curling.jpg", query: "salon hair curls styling" },
  { file: "hair-straightening.jpg", query: "straight hair salon" },
  { file: "hair-dye.jpg", query: "hair coloring salon" },
  { file: "eyebrow-shaping.jpg", query: "eyebrow shaping beauty" },
  { file: "hair-blow-dry.jpg", query: "blow dry hair salon" }
];

async function fetchPhotoUrl(query) {
  const u = new URL("https://api.pexels.com/v1/search");
  u.searchParams.set("query", query);
  u.searchParams.set("per_page", "1");
  const res = await fetch(u, { headers: { Authorization: KEY } });
  if (!res.ok) throw new Error(`Pexels ${res.status}: ${await res.text()}`);
  const data = await res.json();
  const src = data?.photos?.[0]?.src?.large2x || data?.photos?.[0]?.src?.large;
  if (!src) throw new Error("No photo for query: " + query);
  return src;
}

async function downloadToFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Download failed " + res.status);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function main() {
  if (!KEY) {
    console.warn("[fetch-service-images] Set PEXELS_API_KEY to download. Skipping (optional).");
    return;
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  let failed = false;
  for (const { file, query } of JOBS) {
    const dest = path.join(OUT_DIR, file);
    if (fs.existsSync(dest)) {
      console.log("exists, skip:", file);
      continue;
    }
    try {
      console.log("fetching:", file, "←", query);
      const url = await fetchPhotoUrl(query);
      await downloadToFile(url, dest);
      console.log("wrote:", dest);
    } catch (e) {
      console.error(file, e.message);
      failed = true;
    }
  }
  if (failed) process.exit(1);
}

main();
