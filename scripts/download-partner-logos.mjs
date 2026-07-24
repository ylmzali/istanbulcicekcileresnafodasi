#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const targets = [
  {
    file: "ticaret-bakanligi.png",
    urls: [
      "https://istanbulcicekcileresnafodasi.com.tr/images/ticaretbakanl%C4%B1%C4%9F%C4%B1.png",
      "https://istanbulcicekcileresnafodasi.com.tr/images/ticaretbakanl%C4%B1g%C4%B1.png",
      "https://istanbulcicekcileresnafodasi.com.tr/images/ticaretbakanligi.png",
    ],
  },
  {
    file: "tesk.jpg",
    urls: ["https://istanbulcicekcileresnafodasi.com.tr/images/tesk.jpg"],
  },
  {
    file: "istesob.png",
    urls: ["https://istanbulcicekcileresnafodasi.com.tr/images/istesob.png"],
  },
];

const dir = path.join(process.cwd(), "public", "images", "partners");
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
      if (buf.byteLength < 500) {
        console.warn(`Too small ${buf.byteLength} ${url}`);
        continue;
      }
      await writeFile(path.join(dir, target.file), buf);
      console.log(`OK ${target.file} (${buf.byteLength})`);
      saved = true;
      break;
    } catch (error) {
      console.warn(`Fail ${url}`, error instanceof Error ? error.message : error);
    }
  }
  if (!saved) console.error(`MISSING ${target.file}`);
}
