import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = process.argv[2];
if (!source) throw new Error("Usage: npm run assets:logos -- /absolute/path/to/reference.jpeg");
const directory = resolve("public/logos");
await mkdir(directory, { recursive: true });
const logos = [
  ["milklife-ijis-2026", "MilkLife Indonesia Junior International Series 2026", 39, 16, 183, 144, "white"],
];
// Supplied as separate sharp exports instead of being cropped from the reference; never overwritten.
const supplied = [
  ["bwf", "BWF", "bwf.svg"], ["badminton-asia", "Badminton Asia", "badminton-asia.png"], ["pbsi", "PBSI", "pbsi.png"], ["djarum-foundation", "Bakti Olahraga Djarum Foundation", "djarum-foundation.png"],
  // White sponsor logos, mostly from srikandimerdekacup.com (see the README).
  ["5-days-croissant", "5 Days Croissant", "5-days-croissant.svg"], ["blibli", "Blibli", "blibli.svg"], ["caffino", "Caffino", "caffino.svg"],
  ["foxs", "FOX'S", "foxs.svg"], ["gajah", "Gajah", "gajah.svg"], ["hydro-plus", "Hydroplus", "hydro-plus.svg"],
  ["polytron", "Polytron", "polytron.svg"], ["sariwangi", "SariWangi", "sariwangi.png"], ["victor", "Victor", "victor.svg"],
];
const metadata = await sharp(source).metadata();
if (metadata.width !== 1600 || metadata.height !== 900) throw new Error("Expected the original 1600 × 900 reference image.");
const manifest = [];
for (const [id, name, left, top, width, height, background] of logos) {
  const { data, info } = await sharp(source).extract({ left, top, width, height }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  // Flood only the background connected to the crop edges. Preserve white lettering inside logos.
  const visited = new Uint8Array(width * height);
  const queue = [];
  function enqueue(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const pixel = y * width + x;
    if (visited[pixel]) return;
    visited[pixel] = 1;
    const k = pixel * 4;
    const isBackground = background === "white"
      ? Math.min(data[k], data[k + 1], data[k + 2]) > 221
      : Math.max(data[k], data[k + 1], data[k + 2]) < 70;
    if (isBackground) { data[k + 3] = 0; queue.push(pixel); }
  }
  for (let x = 0; x < width; x++) { enqueue(x, 0); enqueue(x, height - 1); }
  for (let y = 0; y < height; y++) { enqueue(0, y); enqueue(width - 1, y); }
  for (let i = 0; i < queue.length; i++) {
    const x = queue[i] % width, y = Math.floor(queue[i] / width);
    enqueue(x - 1, y); enqueue(x + 1, y); enqueue(x, y - 1); enqueue(x, y + 1);
  }
  await sharp(data, { raw: info }).png().toFile(`${directory}/${id}.png`);
  manifest.push({ id, name, file: `/logos/${id}.png`, width, height, crop: { left, top, width, height } });
}
for (const [id, name, file] of supplied) {
  const { width, height } = await sharp(`${directory}/${file}`).metadata();
  manifest.push({ id, name, file: `/logos/${file}`, width, height, supplied: true });
}
await writeFile(`${directory}/manifest.json`, JSON.stringify(manifest, null, 2) + "\n");
console.log(`Wrote ${manifest.length} logos to the manifest.`);
