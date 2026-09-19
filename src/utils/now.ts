import type { CollectionEntry } from 'astro:content';

export type NowEntry = CollectionEntry<'now'>;

export const sortNowEntries = (entries: NowEntry[]) =>
  entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

export const formatNowDate = (date: Date) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

export const getNowUrl = (id: string) => `/now/${id}/`;
