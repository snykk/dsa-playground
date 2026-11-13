import { describe, expect, it } from 'vitest';
import { layoutTree, toneAt, toneClass, treeFromLevelOrder, type TreeNode } from './diagram';

describe('tones', () => {
  it('maps tone characters to classes and ignores unknown ones', () => {
    expect(toneClass('p')).toBe('dg-tone tone-p');
    expect(toneClass('.')).toBe('dg-tone');
    expect(toneClass(undefined)).toBe('dg-tone');
    expect(toneAt('pl.f', 1)).toBe('l');
    expect(toneAt('pl.f', 2)).toBeUndefined();
    expect(toneAt('pl.f', 9)).toBeUndefined();
  });
});

describe('treeFromLevelOrder', () => {
  it('builds a binary tree LeetCode style, keeping empty slots', () => {
    const root = treeFromLevelOrder([8, 3, 10, 1, 6, null, 14], { tones: 'p.....f' }) as TreeNode;
    expect(root.label).toBe(8);
    expect(root.tone).toBe('p');
    const [left, right] = root.children ?? [];
    expect(left?.label).toBe(3);
    expect(right?.children?.[0]).toBeNull();
    expect(right?.children?.[1]?.label).toBe(14);
    expect(right?.children?.[1]?.tone).toBe('f');
  });

  it('returns null for an empty tree', () => {
    expect(treeFromLevelOrder([])).toBeNull();
    expect(treeFromLevelOrder([null])).toBeNull();
  });
});

describe('layoutTree', () => {
  it('centres parents over their children and keeps lone children on their side', () => {
    const root = treeFromLevelOrder([2, 1, 3]) as TreeNode;
    const { placed, slots, depth } = layoutTree(root);
    expect(slots).toBe(2);
    expect(depth).toBe(1);
    expect(placed.find((p) => p.node.label === 2)?.x).toBe(0.5);

    const rightOnly = layoutTree(treeFromLevelOrder([5, null, 9]) as TreeNode);
    const parent = rightOnly.placed.find((p) => p.node.label === 5);
    const child = rightOnly.placed.find((p) => p.node.label === 9);
    expect(child && parent && child.x > parent.x).toBe(true);
  });

  it('gives every leaf its own slot', () => {
    const tree: TreeNode = { label: 'root', children: [{ label: 'a' }, { label: 'b', children: [{ label: 'c' }, { label: 'd' }] }] };
    const { placed, slots } = layoutTree(tree);
    expect(slots).toBe(3);
    const xs = placed.filter((p) => !(p.node.children ?? []).length).map((p) => p.x);
    expect(new Set(xs).size).toBe(xs.length);
  });
});
