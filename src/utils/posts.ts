import type { CollectionEntry } from 'astro:content';

export function getPostDate(entry: CollectionEntry<'blog'>): Date {
  if (entry.data.date) return entry.data.date;
  // Fallback: parse date from filename (e.g., "2022-12-31- GO 的接口.md")
  const match = entry.id.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }
  return new Date(0);
}

export function getPostUrl(id: string): string {
  // Remove .md extension if present
  const cleanId = id.replace(/\.md$/, '');
  const match = cleanId.match(/^(\d{4})-(\d{1,2})-(\d{1,2})-\s*(.+)$/);
  if (!match) return `/${cleanId}/`;
  const [, year, month, day, titleSlug] = match;
  return `/${year}/${month}/${day}/${titleSlug.trim()}/`;
}

export function getSlugFromId(id: string): string {
  const cleanId = id.replace(/\.md$/, '');
  const match = cleanId.match(/^(\d{4})-(\d{1,2})-(\d{1,2})-\s*(.+)$/);
  if (!match) return cleanId;
  const [, year, month, day, titleSlug] = match;
  return `${year}/${month}/${day}/${titleSlug.trim()}`;
}

export function sortPostsByDate(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  return posts.sort((a, b) => getPostDate(b).valueOf() - getPostDate(a).valueOf());
}
