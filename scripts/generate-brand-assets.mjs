import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";

const faviconPath = resolve("public/favicon.svg");
const favicon = await readFile(faviconPath);

await Promise.all([
  sharp(favicon).resize(180, 180).png().toFile("public/apple-touch-icon.png"),
  sharp(favicon).resize(192, 192).png().toFile("public/icon-192.png"),
  sharp(favicon).resize(512, 512).png().toFile("public/icon-512.png"),
]);

console.log("Generated raster brand icons from public/favicon.svg.");
