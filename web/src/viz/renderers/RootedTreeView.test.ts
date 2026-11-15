import { describe, expect, it } from 'vitest';
import { layoutRooted, rootedGeometry, type RtNode, type RtTree } from './RootedTreeView';

const node = (id: string, children: string[] = [], extra: Partial<RtNode> = {}): RtNode => ({ id, label: id, children, ...extra });

describe('layoutRooted', () => {
  it('gives leaves consecutive slots and centers a parent over its first and last child', () => {
    const tree: RtTree = { id: 't', root: '0', nodes: [node('0', ['1', '2', '3']), node('1', ['4']), node('2'), node('3'), node('4')] };
    const l = layoutRooted(tree);
    const [p0, p1, p2, p3, p4] = ['0', '1', '2', '3', '4'].map((id) => l.pos.get(id)!);
    expect(p1.x).toBe(p4.x);
    expect(p2.x - p1.x).toBe(p3.x - p2.x);
    expect(p0.x).toBe((p1.x + p3.x) / 2);
    expect([p0.y < p1.y, p1.y < p4.y, p1.y === p2.y]).toEqual([true, true, true]);
    expect(l.levels).toBe(3);
  });

  it('keeps a place for hidden vertices, so a tree that is still growing does not move', () => {
    const full: RtTree = { id: 'c', root: '1', nodes: [node('1', ['2', '3']), node('2'), node('3')] };
    const growing: RtTree = { ...full, nodes: [node('1', ['2', '3']), node('2', [], { hidden: true }), node('3', [], { hidden: true })] };
    expect([...layoutRooted(growing).pos]).toEqual([...layoutRooted(full).pos]);
  });

  it('shortens the levels of a deep tree, but not below 34px', () => {
    const path: RtTree = { id: 't', root: '0', nodes: Array.from({ length: 16 }, (_, i) => node(String(i), i < 15 ? [String(i + 1)] : [])) };
    const l = layoutRooted(path);
    expect(l.levels).toBe(16);
    expect(l.pos.get('1')!.y - l.pos.get('0')!.y).toBe(34);
  });
});

describe('rootedGeometry', () => {
  const star = (id: string, leaves: number): RtTree => ({
    id,
    root: '0',
    nodes: [node('0', Array.from({ length: leaves }, (_, i) => String(i + 1))), ...Array.from({ length: leaves }, (_, i) => node(String(i + 1)))],
  });

  it('puts two small trees side by side and two wide ones one under the other', () => {
    const small = rootedGeometry({ trees: [star('a', 3), star('b', 3)] });
    expect(small.boxes[0].y).toBe(small.boxes[1].y);
    const wide = rootedGeometry({ trees: [star('a', 15), star('b', 15)] });
    expect(wide.boxes[1].y).toBeGreaterThan(wide.boxes[0].y);
    expect(wide.width).toBeLessThanOrEqual(1040);
  });

  it('reserves room under the trees for the row and its group labels', () => {
    const g = rootedGeometry({ trees: [star('a', 3)], row: { label: 'pos', cells: [null, null, null, null], groups: [] } });
    expect(g.height).toBeGreaterThanOrEqual(g.rowTop + 14 + 26 + 27);
  });
});
