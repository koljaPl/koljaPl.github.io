import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projectLinkSchema = z.object({
  label: z.string(),
  url: z.url().nullable(),
  kind: z.enum(["repository", "demo", "documentation", "other"]),
});

const projectMediaPathSchema = z
  .string()
  .regex(
    /^\/projects\/[A-Za-z0-9/_-]+\.(?:avif|jpe?g|png|webp)$/i,
    "Project media must use a root-relative path inside /projects/.",
  );

const projectMediaVariantSchema = z.object({
  src: projectMediaPathSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

const projectMediaSchema = z
  .object({
    src: projectMediaPathSchema.nullable(),
    alt: z.string().trim().min(1),
    caption: z.string().nullable(),
    kind: z.enum(["screenshot", "artwork", "diagram"]),
    width: z.number().int().positive().nullable(),
    height: z.number().int().positive().nullable(),
    sources: z.array(projectMediaVariantSchema).default([]),
  })
  .superRefine((media, context) => {
    if (media.src === null) {
      if (
        media.width !== null ||
        media.height !== null ||
        media.sources.length > 0
      ) {
        context.addIssue({
          code: "custom",
          message: "Empty project media cannot include dimensions or sources.",
        });
      }
      return;
    }

    if (media.width === null || media.height === null) {
      context.addIssue({
        code: "custom",
        message: "Supplied project media must include intrinsic dimensions.",
      });
      return;
    }

    const widths = [
      media.width,
      ...media.sources.map((source) => source.width),
    ];
    if (new Set(widths).size !== widths.length) {
      context.addIssue({
        code: "custom",
        path: ["sources"],
        message: "Responsive project media widths must be unique.",
      });
    }

    const aspectRatio = media.width / media.height;
    media.sources.forEach((source, index) => {
      if (Math.abs(source.width / source.height - aspectRatio) > 0.01) {
        context.addIssue({
          code: "custom",
          path: ["sources", index],
          message: "Responsive variants must preserve the source aspect ratio.",
        });
      }
    });
  });

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    category: z.string(),
    status: z.enum(["published", "placeholder"]),
    developmentStatus: z.string().nullable().default(null),
    shortDescription: z.string().nullable(),
    longDescription: z.string().nullable(),
    role: z.string().nullable(),
    technologies: z.array(z.string()),
    impact: z.string().nullable(),
    featured: z.boolean(),
    accent: z.enum(["blue", "red", "yellow", "green"]),
    order: z.number().int().nonnegative(),
    repositoryKey: z.string().nullable(),
    links: z.array(projectLinkSchema),
    screenshots: z.array(projectMediaSchema),
    customArtwork: projectMediaSchema.nullable(),
    seoDescription: z.string().nullable(),
  }),
});

export const collections = { projects };
