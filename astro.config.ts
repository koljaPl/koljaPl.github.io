import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { pagePublication } from "./src/data/publication";

const nonIndexablePaths = new Set<string>();
if (!pagePublication.contact) nonIndexablePaths.add("/contact/");
if (!pagePublication.experience) nonIndexablePaths.add("/experience/");
if (!pagePublication.resume) nonIndexablePaths.add("/resume/");

const projectDirectory = fileURLToPath(
  new URL("./src/content/projects", import.meta.url),
);
for (const filename of readdirSync(projectDirectory, {
  encoding: "utf8",
  recursive: true,
}).filter((name) => name.endsWith(".md"))) {
  const source = readFileSync(`${projectDirectory}/${filename}`, "utf8");
  const slug = source.match(/^slug:\s*(\S+)\s*$/m)?.[1];
  const status = source.match(/^status:\s*(published|placeholder)\s*$/m)?.[1];
  if (!slug || !status) {
    throw new Error(`Project publication metadata is missing in ${filename}.`);
  }
  if (status === "placeholder") {
    nonIndexablePaths.add(`/projects/${slug}/`);
  }
}

export default defineConfig({
  site: "https://koljapl.github.io",
  output: "static",
  trailingSlash: "always",
  integrations: [
    sitemap({
      filter: (page) => !nonIndexablePaths.has(new URL(page).pathname),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: "github-dark-default",
      wrap: true,
    },
  },
});
