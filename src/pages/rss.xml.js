import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getContainerRenderer as getMDXRenderer } from "@astrojs/mdx";
import { loadRenderers } from "astro:container";
import { getCollection } from "astro:content";

import rss from "@astrojs/rss";
import { descDateSort } from "../utils/posts.mjs";
import config from "../config.mjs";

const MAX_ITEMS = 10;

export async function GET(context) {
  const renderers = await loadRenderers([getMDXRenderer()]);
  const container = await AstroContainer.create({ renderers });
  const posts = (await getCollection("posts"))
    .sort(descDateSort)
    .slice(0, MAX_ITEMS);
  return rss({
    title: config.title + config.titleSuffix,
    description: config.description,
    site: context.url,
    items: await Promise.all(
      posts.map(async (post) => {
        const { Content } = await post.render();

        return {
          title: post.data.title,
          pubDate: post.data.pubDate,
          description: post.data.intro,
          link: new URL(`/posts/${post.slug}`, context.url.origin).toString(),
          content: await container.renderToString(Content),
        };
      })
    ),
    customData: "<language>en-us</language>",
  });
}
