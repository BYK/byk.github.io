import { defineConfig } from "astro/config";
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import { wordCount } from "./src/utils/word-count.mjs";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), icon()],
  markdown: {
    processor: unified({
      remarkPlugins: [
        () =>
          (tree, { data }) => {
            const words = wordCount(tree);
            data.astro.frontmatter.words = words;
          },
      ],
    }),
  },
  site: "https://byk.im",
  build: {
    assetsPrefix: "https://byk.im/",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
