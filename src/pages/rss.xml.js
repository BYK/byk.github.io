import { experimental_AstroContainer as AstroContainer } from "astro/container";
import mdxRenderer from "@astrojs/mdx/server.js";
import { getCollection } from "astro:content";

import rss from "@astrojs/rss";
import { descDateSort } from "../utils/posts.mjs";
import config from "../config.mjs";

const MAX_ITEMS = 10;

export async function GET(context) {
  // This method is borrowed from https://blog.damato.design/posts/astro-rss-mdx/
  const container = await AstroContainer.create({});
  container.addServerRenderer({ renderer: mdxRenderer });
  const posts = (await getCollection("posts"))
    .sort(descDateSort)
    .slice(0, MAX_ITEMS);

  return rss({
    title: config.title,
    description: config.description,
    site: context.url,
    items: await Promise.all(
      posts.map(async (post) => ({
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.intro,
        link: new URL(`/posts/${post.slug}`, context.url.origin).toString(),
        content: await container.renderToString((await post.render()).Content),
      }))
    ),
    customData: "<language>en-us</language>",
  });
}
