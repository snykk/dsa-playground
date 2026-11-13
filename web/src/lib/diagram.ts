/**
 * Shared logic for the static article diagrams (ArrayDiagram, TreeDiagram, GraphDiagram,
 * ListDiagram, GridDiagram). They all use one tone vocabulary, written as one character
 * per element so that MDX stays compact:
 *
 *   p  primary        orange fill   (the element being worked on: pivot, current node)
 *   l  light          blue tint     (a highlighted group: left part, search path, window)
 *   r  secondary      grey fill     (another group: right part, visited)
 *   c  current        thick outline (a pointer target such as j or curr)
 *   f  final          aqua fill     (settled, the answer, a found key)
 *   m  muted          faded         (discarded, out of range)
 *   .  no tone
 *
 * Every diagram also takes a legend that says what each tone means in that picture.
 */

export const TONE_KEYS = ['p', 'l', 'r', 'c', 'f', 'm'] as const;
export type ToneKey = (typeof TONE_KEYS)[number];

export function isTone(tone: string | undefined | null): tone is ToneKey {
  return typeof tone === 'string' && (TONE_KEYS as readonly string[]).includes(tone);
}

/** Class list for an element with an optional tone, e.g. "dg-tone tone-p". */
export function toneClass(tone?: string | null): string {
  return isTone(tone) ? `dg-tone tone-${tone}` : 'dg-tone';
}

/** The tone at position i of a tone string such as "pl..f". */
export function toneAt(tones: string | undefined, i: number): ToneKey | undefined {
  const t = tones?.[i];
  return isTone(t) ? t : undefined;
}

export interface TreeNode {
  /** A value, a short word, or several keys for a multi-key node (B-tree). */
  label?: string | number | Array<string | number>;
  tone?: string;
  /** Small note at the top right of the node: balance factor, size, priority, ... */
  badge?: string;
  /** Label on the edge from the parent (a trie letter, "L" / "R"). */
  edge?: string;
  /** Tone of the edge from the parent (e.g. "l" for a search path). */
  edgeTone?: string;
  /** Children in order; null keeps an empty slot so a lone right child still sits on the right. */
  children?: Array<TreeNode | null>;
}

/**
 * A binary tree from level order with nulls, LeetCode style: [8, 3, 10, 1, 6, null, 14].
 * tones / edgeTones / badges are indexed by position in the same array.
 */
export function treeFromLevelOrder(
  values: Array<string | number | null>,
  opts: { tones?: string; edgeTones?: string; badges?: Array<string | null> } = {},
): TreeNode | null {
  if (values.length === 0 || values[0] === null) return null;
  const make = (i: number): TreeNode => ({
    label: values[i] as string | number,
    tone: toneAt(opts.tones, i),
    edgeTone: toneAt(opts.edgeTones, i),
    badge: opts.badges?.[i] ?? undefined,
    children: [],
  });
  const root = make(0);
  const queue: TreeNode[] = [root];
  let i = 1;
  while (queue.length > 0 && i < values.length) {
    const node = queue.shift() as TreeNode;
    const kids: Array<TreeNode | null> = [];
    for (let side = 0; side < 2; side++) {
      const v = i < values.length ? values[i] : null;
      if (v === null) {
        kids.push(null);
      } else {
        const child = make(i);
        kids.push(child);
        queue.push(child);
      }
      i++;
    }
    node.children = kids;
  }
  return root;
}

export interface PlacedNode {
  node: TreeNode;
  /** Horizontal position in slots (leaves take consecutive slots). */
  x: number;
  depth: number;
  parent?: PlacedNode;
}

/**
 * Tidy layout: leaves (and empty child slots) take consecutive slots, and every parent
 * sits centred over its first and last child.
 */
export function layoutTree(root: TreeNode): { placed: PlacedNode[]; slots: number; depth: number } {
  const placed: PlacedNode[] = [];
  let slot = 0;
  let maxDepth = 0;
  const visit = (node: TreeNode, depth: number, parent?: PlacedNode): number => {
    maxDepth = Math.max(maxDepth, depth);
    const entry: PlacedNode = { node, x: 0, depth, parent };
    placed.push(entry);
    const kids = node.children ?? [];
    if (!kids.some((k) => k !== null)) {
      entry.x = slot;
      slot += 1;
      return entry.x;
    }
    const xs = kids.map((k) => {
      if (k !== null) return visit(k, depth + 1, entry);
      slot += 1;
      return slot - 1;
    });
    entry.x = (xs[0] + xs[xs.length - 1]) / 2;
    return entry.x;
  };
  visit(root, 0);
  return { placed, slots: slot, depth: maxDepth };
}
