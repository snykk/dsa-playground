/**
 * Practice problems at the end of an article. Each one links to a judge's own problem page, so
 * the list is limited to judges whose problem pages load at a stable URL.
 */
export const PRACTICE_JUDGES = [
  'leetcode.com',
  'cses.fi',
  'codeforces.com',
  'atcoder.jp',
  'spoj.com',
  'hackerrank.com',
  'open.kattis.com',
  'onlinejudge.org',
  'usaco.org',
] as const;

export interface PracticeProblem {
  /** The judge's own title. */
  name: string;
  /** The judge and its number or id, e.g. "LeetCode 912" or "CSES 1068". */
  site: string;
  /** The problem page: https, on a known judge, without tracking parameters. */
  url: string;
  /** One clause on what of the topic the problem exercises. */
  idea: string;
}

/** What is wrong with one practice problem, as readable lines; empty when nothing is. */
export function practiceProblemIssues(p: PracticeProblem): string[] {
  const out: string[] = [];
  for (const key of ['name', 'site', 'url', 'idea'] as const) {
    if (typeof p[key] !== 'string' || !p[key].trim()) out.push(`${key} is empty`);
  }
  if (typeof p.url !== 'string' || !p.url) return out;
  let url: URL;
  try {
    url = new URL(p.url);
  } catch {
    return [...out, `${p.url} is not a URL`];
  }
  if (url.protocol !== 'https:') out.push(`${p.url} is not https`);
  if (url.search) out.push(`${p.url} has query parameters`);
  const host = url.hostname.replace(/^www\./, '');
  if (!PRACTICE_JUDGES.some((j) => host === j || host.endsWith(`.${j}`))) out.push(`${p.url}: ${host} is not one of the known judges`);
  return out;
}
