import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { practiceProblemIssues } from './practice';

const ok = { name: 'Sort an Array', site: 'LeetCode 912', url: 'https://leetcode.com/problems/sort-an-array/', idea: 'quick sort itself' };

describe('practiceProblemIssues', () => {
  it('accepts a problem on a known judge', () => {
    expect(practiceProblemIssues(ok)).toEqual([]);
    expect(practiceProblemIssues({ ...ok, url: 'https://cses.fi/problemset/task/1068' })).toEqual([]);
    expect(practiceProblemIssues({ ...ok, url: 'https://www.spoj.com/problems/PRIME1/' })).toEqual([]);
  });
  it('names every problem', () => {
    expect(practiceProblemIssues({ ...ok, idea: ' ' })).toEqual(['idea is empty']);
    expect(practiceProblemIssues({ ...ok, url: 'http://leetcode.com/problems/sort-an-array/' })).toEqual(['http://leetcode.com/problems/sort-an-array/ is not https']);
    expect(practiceProblemIssues({ ...ok, url: 'https://leetcode.com/problems/sort-an-array/?envType=study-plan' })).toHaveLength(1);
    expect(practiceProblemIssues({ ...ok, url: 'https://example.com/p/1' })[0]).toMatch(/not one of the known judges/);
    expect(practiceProblemIssues({ ...ok, url: 'not a url' })[0]).toMatch(/not a URL/);
  });
});

/**
 * Articles without a practice section, and why. Only a topic no judge has a problem for may
 * be listed here; its README keeps exercises instead.
 */
const NO_JUDGE_PROBLEMS: Record<string, string> = {
  'galois-field.mdx': 'no judge problem practises GF(2^8) arithmetic',
  'reed-solomon.mdx': 'no judge problem practises Reed-Solomon encoding or decoding',
};

describe('practice problems in the articles', () => {
  const dir = new URL('../content/articles/', import.meta.url);
  const files = readdirSync(dir).filter((f) => f.endsWith('.mdx'));
  const sources = new Map(files.map((f) => [f, readFileSync(new URL(f, dir), 'utf8')]));
  const blocks = files.flatMap((f) => [...sources.get(f)!.matchAll(/<PracticeProblems[\s\S]*?\/>/g)].map((m) => ({ file: f, text: m[0] })));
  it('appear in every article, once, under a "Practice problems" heading', () => {
    const problems: string[] = [];
    for (const [file, text] of sources) {
      const sections = [...text.matchAll(/<PracticeProblems\b/g)].length;
      const headed = /^## Practice problems\n\n(?:[^\n]+\n\n)?<PracticeProblems\b/m.test(text);
      if (file in NO_JUDGE_PROBLEMS) {
        if (sections > 0) problems.push(`${file}: has practice problems now; remove it from NO_JUDGE_PROBLEMS`);
      } else if (sections !== 1 || !headed) problems.push(`${file}: ${sections} practice sections${headed ? '' : ', none under "## Practice problems"'}`);
    }
    expect(problems).toEqual([]);
  });
  it('list each problem once per article', () => {
    const problems: string[] = [];
    for (const { file, text } of blocks) {
      const urls = [...text.matchAll(/url:\s*(['"])(.*?)\1/g)].map((m) => m[2]);
      for (const u of new Set(urls)) if (urls.indexOf(u) !== urls.lastIndexOf(u)) problems.push(`${file}: ${u} twice`);
    }
    expect(problems).toEqual([]);
  });
  it('link only to known judges, over https', () => {
    const problems: string[] = [];
    for (const { file, text } of blocks) {
      for (const m of text.matchAll(/url:\s*(['"])(.*?)\1/g)) {
        for (const issue of practiceProblemIssues({ name: 'x', site: 'x', idea: 'x', url: m[2] })) problems.push(`${file}: ${issue}`);
      }
    }
    expect(problems).toEqual([]);
  });
  it('give 3 to 5 problems, each with a name, a site, a url and an idea', () => {
    const problems: string[] = [];
    for (const { file, text } of blocks) {
      const count = (key: string) => [...text.matchAll(new RegExp(`\\b${key}:\\s*['"]`, 'g'))].length;
      const n = count('url');
      if (n < 3 || n > 5) problems.push(`${file}: ${n} problems`);
      for (const key of ['name', 'site', 'idea']) if (count(key) !== n) problems.push(`${file}: ${count(key)} ${key} fields for ${n} problems`);
    }
    expect(problems).toEqual([]);
  });
});
