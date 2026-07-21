import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const postsCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      intro: z.string(),
      tag: z.string(),
      image: image().optional(),
      author: reference("author"),
      pubDate: z.date(),
      type: z.string().optional(),
      slug: z.string().optional(),
    }),
});

const authorCollection = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/author" }),
  schema: ({ image }) =>
    z.object({
      displayName: z.string(),
      bio: z.string().optional(),
      photo: image().optional(),
    }),
});

export const collections = {
  posts: postsCollection,
  author: authorCollection,
};
