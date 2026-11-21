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

describe('practice problems in the articles', () => {
  const dir = new URL('../content/articles/', import.meta.url);
  const blocks = readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .flatMap((f) => [...readFileSync(new URL(f, dir), 'utf8').matchAll(/<PracticeProblems[\s\S]*?\/>/g)].map((m) => ({ file: f, text: m[0] })));
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
