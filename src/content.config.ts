import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    layout: z.string().optional(),
    title: z.string(),
    date: z.coerce.date().optional(),
    categories: z.array(z.string()).default([]),
    description: z.string().optional(),
    keywords: z.union([z.string(), z.number(), z.array(z.string())]).optional(),
    essays: z.boolean().optional(),
    topmost: z.boolean().default(false),
    mermaid: z.boolean().optional(),
    mathjax: z.boolean().optional(),
    mindmap: z.boolean().optional(),
    img: z.string().optional(),
  }),
});

export const collections = { blog };
