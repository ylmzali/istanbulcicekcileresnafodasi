#!/usr/bin/env node
/**
 * Downloads past-president portraits from the live chamber site.
 * Usage: node scripts/download-past-presidents.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const targets = [
  {
    file: "huseyin-gulerler.jpg",
    urls: ["https://istanbulcicekcileresnafodasi.com.tr/images/cerceve.jpg"],
  },
  {
    file: "ahmet-nadir-yuksel.jpg",
    urls: ["https://istanbulcicekcileresnafodasi.com.tr/images/Ahmet-YUKSEL.jpeg"],
  },
  {
    file: "muammer-erdem.jpg",
    urls: ["https://istanbulcicekcileresnafodasi.com.tr/images/Muammer-ERDEM.jpeg"],
  },
  {
    file: "yunis-erdogan.jpg",
    urls: [
      "https://istanbulcicekcileresnafodasi.com.tr/images/Yunis-ERDOGAN.jpeg?v=2",
      "https://istanbulcicekcileresnafodasi.com.tr/images/Yunis-ERDOGAN.jpeg",
    ],
  },
  {
    file: "sunay-calisir.jpg",
    urls: [
      "https://istanbulcicekcileresnafodasi.com.tr/images/Sunay-Cal%C4%B1s%C4%B1r.jpeg",
      "https://istanbulcicekcileresnafodasi.com.tr/images/Sunay-Calısır.jpeg",
    ],
  },
];

const dir = path.join(process.cwd(), "public", "images", "past-presidents");
await mkdir(dir, { recursive: true });

for (const target of targets) {
  let saved = false;
  for (const url of target.urls) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        redirect: "follow",
      });
      if (!res.ok) {
        console.warn(`HTTP ${res.status} ${url}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength < 800) {
        console.warn(`Too small (${buf.byteLength}) ${url}`);
        continue;
      }
      await writeFile(path.join(dir, target.file), buf);
      console.log(`OK ${target.file} (${buf.byteLength} bytes)`);
      saved = true;
      break;
    } catch (error) {
      console.warn(`Fail ${url}:`, error instanceof Error ? error.message : error);
    }
  }
  if (!saved) console.error(`MISSING ${target.file}`);
}
