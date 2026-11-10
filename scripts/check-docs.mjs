import { readFile, readdir, access } from "node:fs/promises";
import { dirname, resolve } from "node:path";

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((e) => e.isDirectory() ? files(`${directory}/${e.name}`) : e.name.endsWith(".md") ? [`${directory}/${e.name}`] : []));
  return nested.flat();
}
const failures = [];
for (const file of ["README.md", ...await files("docs")]) {
  const content = await readFile(file, "utf8");
  for (const [, link] of content.matchAll(/\]\(([^)]+)\)/g)) {
    if (/^(https?:|#|mailto:)/.test(link)) continue;
    const target = resolve(dirname(file), decodeURIComponent(link.split("#")[0]));
    try { await access(target); } catch { failures.push(`${file}: ${link}`); }
  }
}
if (failures.length) { console.error(failures.join("\n")); process.exitCode = 1; }
else console.log("All documentation links resolve.");
