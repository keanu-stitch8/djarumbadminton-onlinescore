import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeBasePath, prefixPath } from "./base-path.ts";

test("base paths are normalized to Next.js basePath format", () => {
  assert.equal(normalizeBasePath(undefined), "");
  assert.equal(normalizeBasePath(""), "");
  assert.equal(normalizeBasePath("/"), "");
  assert.equal(normalizeBasePath("mlijis-2026/venue2/"), "/mlijis-2026/venue2");
  assert.equal(normalizeBasePath(" /mlijis-2026//venue2 "), "/mlijis-2026/venue2");
});

test("root-relative paths get the base path; absolute URLs are left alone", () => {
  assert.equal(prefixPath("/mlijis-2026/venue2", "/api/scores"), "/mlijis-2026/venue2/api/scores");
  assert.equal(prefixPath("", "/logos/bwf.png"), "/logos/bwf.png");
  assert.equal(prefixPath("/x", "https://flagcdn.com/my.svg"), "https://flagcdn.com/my.svg");
});
