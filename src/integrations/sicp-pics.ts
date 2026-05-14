import type { AstroIntegration } from 'astro';
import { mkdir, writeFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = 'cat-milk/Anime-Girls-Holding-Programming-Books';
const BRANCH = 'master';
const DIR = 'SICP';
const HTML_URL = `https://github.com/${REPO}/tree/${BRANCH}/${DIR}`;
const API_URL = `https://api.github.com/repos/${REPO}/contents/${DIR}?ref=${BRANCH}`;
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${DIR}/`;

const IMG_RE = /\.(png|jpe?g|gif|webp)$/i;
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // refresh weekly

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUT_PATH = resolve(__dirname, '../generated/sicp-pics.json');

interface Pic { url: string; name: string }
interface Logger { info: (m: string) => void; warn: (m: string) => void }

async function fileFreshEnough(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return Date.now() - s.mtimeMs < TTL_MS;
  } catch {
    return false;
  }
}

/** Parse the GitHub directory HTML page (no rate limit) for file names. */
async function fetchViaHtml(): Promise<Pic[]> {
  const r = await fetch(HTML_URL, {
    headers: {
      'User-Agent': 'astro-sicp-pics-integration',
      Accept: 'text/html',
    },
  });
  if (!r.ok) throw new Error(`HTML ${r.status} ${r.statusText}`);
  const html = await r.text();
  const re = new RegExp(`"path":"${DIR}/([^"]+)"`, 'g');
  const seen = new Set<string>();
  const list: Pic[] = [];
  for (const m of html.matchAll(re)) {
    const name = m[1];
    if (!IMG_RE.test(name)) continue;
    if (seen.has(name)) continue;
    seen.add(name);
    list.push({ name, url: RAW_BASE + encodeURI(name) });
  }
  if (list.length === 0) throw new Error('HTML parse: 0 images');
  return list;
}

/** Fall back to authenticated REST API (uses GITHUB_TOKEN if available). */
async function fetchViaApi(): Promise<Pic[]> {
  const headers: Record<string, string> = {
    'User-Agent': 'astro-sicp-pics-integration',
    Accept: 'application/vnd.github+json',
  };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  const r = await fetch(API_URL, { headers });
  if (!r.ok) throw new Error(`API ${r.status} ${r.statusText}`);
  const data: Array<{ name?: string; download_url?: string | null }> = await r.json();
  return data
    .filter(x => x && x.download_url && IMG_RE.test(x.name || ''))
    .map(x => ({ url: x.download_url as string, name: x.name as string }));
}

async function fetchList(logger: Logger): Promise<Pic[]> {
  // Try HTML first (no rate limit), fall back to API.
  try {
    const list = await fetchViaHtml();
    logger.info(`[sicp-pics] fetched ${list.length} images via HTML`);
    return list;
  } catch (e1) {
    logger.warn(`[sicp-pics] HTML method failed: ${(e1 as Error).message}, trying API…`);
    const list = await fetchViaApi();
    logger.info(`[sicp-pics] fetched ${list.length} images via API`);
    return list;
  }
}

async function generate(force: boolean, logger: Logger) {
  if (!force && (await fileFreshEnough(OUT_PATH))) {
    logger.info('[sicp-pics] cache fresh, skip fetch');
    return;
  }
  try {
    const list = await fetchList(logger);
    await mkdir(dirname(OUT_PATH), { recursive: true });
    await writeFile(OUT_PATH, JSON.stringify(list, null, 2), 'utf-8');
    logger.info(`[sicp-pics] wrote ${list.length} entries to ${OUT_PATH}`);
  } catch (err) {
    logger.warn(`[sicp-pics] all sources failed (${(err as Error).message}); banner will be hidden.`);
    try {
      await stat(OUT_PATH);
    } catch {
      await mkdir(dirname(OUT_PATH), { recursive: true });
      await writeFile(OUT_PATH, '[]', 'utf-8');
    }
  }
}

export default function sicpPics(): AstroIntegration {
  return {
    name: 'sicp-pics',
    hooks: {
      'astro:config:setup': async ({ logger }) => {
        await generate(false, logger);
      },
      'astro:build:start': async ({ logger }) => {
        await generate(true, logger);
      },
    },
  };
}
