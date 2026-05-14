import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { getPostDate, getPostUrl, sortPostsByDate } from '../utils/posts';

export async function GET(context) {
  const posts = sortPostsByDate(await getCollection('blog'));

  return rss({
    title: "nyaaar's Blog",
    description: 'nyaaar 的个人技术博客，记录整理一下学到的知识',
    site: context.site,
    items: posts.map(post => ({
      title: post.data.title,
      pubDate: getPostDate(post),
      description: post.data.description || '',
      link: getPostUrl(post.id),
    })),
    customData: `<language>zh-CN</language>`,
  });
}
