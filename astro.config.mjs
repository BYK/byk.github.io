import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import { wordCount } from "./word-count.mjs";

// https://astro.build/config
export default defineConfig({
  integrations: [
    tailwind(),
    mdx({
      remarkPlugins: [
        () =>
          (tree, { data }) => {
            const words = wordCount(tree);
            data.astro.frontmatter.words = words;
          },
      ],
    }),
    icon(),
  ],
  site: "https://byk.im",
});
