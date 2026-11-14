/**
 * Suffix tree tracer, drawn with MultiwayTreeView (dot nodes, edges labelled with their
 * substring and its [start, end] indices into the text, leaves showing their suffix index).
 *
 * Mirrors Data_Structures/Non_Linear/Trees/Suffix_Tree/Python/suffix_tree.py, class SuffixTree:
 * __init__ appends the terminator (the NUL character, drawn as $) and _build_tree inserts the
 * suffixes text[0:], text[1:], ... one by one with _insert_suffix (the naive O(n^2) build, not
 * Ukkonen). A mismatch inside an edge calls _split_edge: a new internal node takes the matched
 * part and the dict slot of the old child, the old child keeps the rest of its label, and a new
 * leaf takes the rest of the suffix (v0.2.0 made this the behaviour of every language).
 * search(pattern) walks down matching edge labels and returns the sorted suffix indices of the
 * leaves below the point where the pattern ends (collected with an explicit stack); an empty
 * pattern returns []. Children are a dict, so they keep insertion order, and so does the picture.
 * Golden fixtures (__fixtures__/multiwayTrees.json, section suffixTree) pin the tree after each
 * suffix, every split and every search result.
 *
 * Input: "banana; ana na x"   (the text, then the patterns to search; "" is the empty pattern)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { MwEdgeLabel, MwNode, MwState } from '../renderers/MultiwayTreeView';
import type { StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';

/* ---------- input ---------- */

export interface SuffixInput {
  text: string;
  patterns: string[];
}

export const SUFFIX_LIMITS = { textLength: 6, patternLength: 7, maxPatterns: 6 };

/** The terminator suffix_tree.py appends (TERMINATOR = '\0'); the picture draws it as $. */
export const TERMINATOR = String.fromCharCode(0);

const EXAMPLE = 'Write the text, a semicolon, then the patterns to search, for example "banana; ana na x".';

/** Parse "banana; ana na x" (also "text banana; search ana, search na"). */
export function parseSuffixTree(input: string): SuffixInput {
  const tokens = input
    .split(/[\s,;]+/)
    .filter(Boolean)
    .filter((tok, i) => !(i === 0 && /^(text|build)$/i.test(tok)));
  if (tokens.length === 0) throw new InputError(`Enter a text. ${EXAMPLE}`);
  const [first, ...rest] = tokens;
  if (!/^[a-z]+$/.test(first)) {
    throw new InputError(
      /^[A-Za-z]+$/.test(first)
        ? `"${first}": use lowercase letters for the text.`
        : `"${first}": the text is lowercase letters a to z (the $ drawn at its end is the terminator the code appends). ${EXAMPLE}`,
    );
  }
  if (first.length > SUFFIX_LIMITS.textLength) throw new InputError(`The text may have at most ${SUFFIX_LIMITS.textLength} letters here, so every suffix fits on screen (got ${first.length}).`);
  const patterns: string[] = [];
  for (let i = 0; i < rest.length; i++) {
    let tok = rest[i];
    if (/^(search|find)$/i.test(tok)) {
      if (rest[i + 1] === undefined) throw new InputError(`"${tok}" needs a pattern after it.`);
      tok = rest[++i];
    }
    const p = tok.replace(/^\?/, '');
    if (p === '""' || p === "''") patterns.push('');
    else if (/^[a-z]+$/.test(p)) {
      if (p.length > SUFFIX_LIMITS.patternLength) throw new InputError(`"${tok}": patterns have at most ${SUFFIX_LIMITS.patternLength} letters here.`);
      patterns.push(p);
    } else throw new InputError(`"${tok}" is not a pattern: use lowercase letters, or "" for the empty pattern. ${EXAMPLE}`);
  }
  if (patterns.length > SUFFIX_LIMITS.maxPatterns) throw new InputError(`At most ${SUFFIX_LIMITS.maxPatterns} patterns, please (got ${patterns.length}).`);
  return { text: first, patterns };
}

/* ---------- pseudocode (reads like suffix_tree.py) ---------- */

export const SUFFIX_CODE = [
  'SuffixTree(text): text = text + TERMINATOR; for i in range(n): _insert_suffix(i)',
  '_insert_suffix(start): node = root; i = start',
  '  while i < n: char = text[i]',
  '    if char not in node.children: node.children[char] = Leaf(i, n - 1, start); return',
  '    child = node.children[char]; j = 0',
  '    while j < edge_length and i + j < n: if text[child.start + j] != text[i + j]:',
  '      _split_edge(node, char, child.start + j, i + j, start); return',
  '    i += edge_length; node = child          # the whole label matched',
  '_split_edge(parent, char, split_pos, text_pos, suffix):',
  '  internal = Node(old.start, split_pos - 1); old.start = split_pos',
  '  parent.children[char] = internal; internal.children[text[split_pos]] = old',
  '  internal.children[text[text_pos]] = Leaf(text_pos, n - 1, suffix)',
  'search(pattern): node = root; i = 0',
  '  while i < m: if pattern[i] not in node.children: return []',
  '    match pattern[i:] along the child\'s label; a mismatch: return []',
  '    i += j; if i >= m: return sorted(suffix indices of the leaves below child)',
  '    node = child',
  '  return []          # an empty pattern never enters the loop',
];

const L = {
  build: 0,
  insert: 1,
  loop: 2,
  leaf: 3,
  child: 4,
  compare: 5,
  split: 6,
  follow: 7,
  splitEdge: 8,
  splitDo: 9,
  splitLink: 10,
  splitLeaf: 11,
  search: 12,
  noChild: 13,
  mismatch: 14,
  collect: 15,
  down: 16,
  empty: 17,
};

/* ---------- tracer ---------- */

interface SNode {
  id: string;
  start: number | null;
  end: number | null;
  suffix: number;
  children: Map<string, SNode>;
}

/** A node as the fixture stores it: [start, end, suffix_index, [[char, child], ...]] in dict order. */
export type SuffixDump = [number | null, number | null, number, Array<[string, SuffixDump]>];

export interface SuffixRun {
  frames: Array<Frame<MwState>>;
  /** The tree after each suffix is inserted, and the splits it made: [split_pos, text_pos, suffix]. */
  build: Array<{ tree: SuffixDump; splits: number[][] }>;
  searches: Array<[string, number[]]>;
}

interface Snap {
  nodes?: Record<string, Role>;
  edges?: Record<string, Role>;
  /** Per-character marks on an edge label, keyed by the child id. */
  marks?: Record<string, Array<Role | undefined>>;
  text?: Record<number, Role>;
  pattern?: { p: string; roles: Record<number, Role> };
  result?: number[] | null;
  vars?: Array<[string, string | number]>;
}

export function dumpSuffixTree(n: SNode): SuffixDump {
  return [n.start, n.end, n.suffix, [...n.children].map(([ch, c]): [string, SuffixDump] => [ch, dumpSuffixTree(c)])];
}

export function suffixTrace(input: SuffixInput): SuffixRun {
  const original = input.text;
  const text = original + TERMINATOR;
  const n = text.length;
  const show = (s: string) => s.split(TERMINATOR).join('$');
  const label = (c: SNode) => show(text.slice(c.start!, c.end! + 1));
  const range = (c: SNode) => `[${c.start},${c.end}]`;
  let serial = 0;
  const root: SNode = { id: 'root', start: null, end: null, suffix: -1, children: new Map() };
  const frames: Array<Frame<MwState>> = [];
  const build: SuffixRun['build'] = [];
  const searches: SuffixRun['searches'] = [];
  let phase = 'build';
  let splits: number[][] = [];

  const counts = () => {
    let leaves = 0;
    let internal = 0;
    const stack = [root];
    while (stack.length) {
      const x = stack.pop()!;
      if (x.suffix !== -1) leaves++;
      else if (x !== root) internal++;
      stack.push(...x.children.values());
    }
    return { leaves, internal };
  };

  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const nodes: MwNode[] = [];
    const visit = (x: SNode) => {
      const edge: MwEdgeLabel | undefined =
        x === root ? undefined : { text: label(x), sub: range(x), marks: o.marks?.[x.id], role: o.marks?.[x.id] ? undefined : o.edges?.[x.id] };
      nodes.push({
        id: x.id,
        children: [...x.children.values()].map((c) => c.id),
        label: x.suffix === -1 ? undefined : String(x.suffix),
        role: o.nodes?.[x.id],
        edge,
      });
      for (const c of x.children.values()) visit(c);
    };
    visit(root);
    const c = counts();
    const strips: MwState['strips'] = [];
    if (o.pattern) {
      const chars = [...o.pattern.p];
      strips.push({ label: 'Pattern', items: chars.length ? chars.map((ch, i): StripItem => ({ text: ch, role: o.pattern!.roles[i] })) : [{ text: "''", role: 'muted' }] });
    }
    if (o.result !== undefined) strips.push({ label: 'Result', items: o.result === null ? [] : o.result.length ? o.result.map((r): StripItem => ({ text: String(r), role: 'good' })) : [{ text: '[]', role: 'muted' }] });
    if (searches.length && phase === 'search') {
      strips.push({ label: 'Searched', items: searches.map(([p, r]): StripItem => ({ text: `'${p}' ${SYM.rightArrow} [${r.join(', ')}]`, role: 'muted' })) });
    }
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['n (with the terminator)', n], ['leaves', c.leaves], ['internal nodes', c.internal]],
      state: {
        nodes,
        root: root.id,
        edgeRoles: o.edges,
        text: { label: 'text', cells: [...text].map((ch, i) => ({ ch: show(ch), role: o.text?.[i] })) },
        strips,
      },
    });
  };

  const textRoles = (from: number, to: number, role: Role, base: Record<number, Role> = {}) => {
    const out: Record<number, Role> = { ...base };
    for (let k = from; k < to; k++) out[k] = role;
    return out;
  };

  /* ----- build ----- */

  const splitEdge = (parent: SNode, ch: string, splitPos: number, textPos: number, suffixIdx: number) => {
    const old = parent.children.get(ch)!;
    const oldEnd = old.end!;
    const internal: SNode = { id: `s${serial++}`, start: old.start, end: splitPos - 1, suffix: -1, children: new Map() };
    old.start = splitPos;
    old.end = oldEnd;
    const leaf: SNode = { id: `s${serial++}`, start: textPos, end: n - 1, suffix: suffixIdx, children: new Map() };
    parent.children.set(ch, internal);
    internal.children.set(text[splitPos], old);
    internal.children.set(text[textPos], leaf);
    splits.push([splitPos, textPos, suffixIdx]);
    snap(
      L.splitLink,
      `_split_edge: a new internal node takes the matched part '${label(internal)}' ${range(internal)} and the old edge's place under its parent. ` +
        `Below it, the old child keeps the rest of its label '${label(old)}' ${range(old)}, and a new leaf takes the rest of the suffix, '${label(leaf)}' ${range(leaf)}, for suffix ${suffixIdx}. ` +
        `Their labels start with different characters ('${show(text[splitPos])}' and '${show(text[textPos])}'), as siblings must.`,
      {
        nodes: { [internal.id]: 'active', [leaf.id]: 'done', [old.id]: 'compare' },
        edges: { [internal.id]: 'active', [leaf.id]: 'done', [old.id]: 'compare' },
        text: textRoles(suffixIdx, textPos, 'compare', textRoles(textPos, n, 'done')),
      },
    );
  };

  const insertSuffix = (start: number) => {
    let node = root;
    let i = start;
    const base = textRoles(start, n, 'compare');
    snap(L.insert, `Insert suffix ${start}: text[${start}:] = '${show(text.slice(start))}'. Walk down from the root, matching it against the edge labels.`, {
      nodes: { [root.id]: 'active' },
      text: base,
    });
    while (i < n) {
      const ch = text[i];
      const child = node.children.get(ch);
      if (!child) {
        const leaf: SNode = { id: `s${serial++}`, start: i, end: n - 1, suffix: start, children: new Map() };
        node.children.set(ch, leaf);
        snap(
          L.leaf,
          `No edge from ${node === root ? 'the root' : 'this node'} starts with '${show(ch)}': add a leaf whose label is the rest of the suffix, text[${i}:${n}] = '${label(leaf)}' ${range(leaf)}, with suffix_index ${start}.`,
          { nodes: { [leaf.id]: 'done', [node.id]: 'compare' }, edges: { [leaf.id]: 'done' }, text: textRoles(i, n, 'done', textRoles(start, i, 'compare')) },
        );
        return;
      }
      const len = child.end! - child.start! + 1;
      let j = 0;
      while (j < len && i + j < n) {
        if (text[child.start! + j] !== text[i + j]) {
          const marks: Array<Role | undefined> = Array.from({ length: len }, (_, k) => (k < j ? 'compare' : k === j ? 'bad' : undefined));
          snap(
            L.split,
            `The edge '${label(child)}' ${range(child)} starts with '${show(ch)}'. ` +
              `${j === 1 ? 'Its first character matches' : `Its first ${j} characters match`} ('${show(text.slice(i, i + j))}'), then text[${child.start! + j}] = '${show(text[child.start! + j])}' differs from text[${i + j}] = '${show(text[i + j])}': ` +
              `the suffix leaves the edge in its middle, so the edge must be split after ${j} character${j === 1 ? '' : 's'}.`,
            {
              nodes: { [node.id]: 'compare' },
              edges: { [child.id]: 'compare' },
              marks: { [child.id]: marks },
              text: { ...textRoles(start, n, 'compare'), ...textRoles(i, i + j, 'done'), [i + j]: 'bad' },
            },
          );
          splitEdge(node, ch, child.start! + j, i + j, start);
          return;
        }
        j++;
      }
      if (i + j < n) {
        snap(
          L.follow,
          `The edge '${label(child)}' ${range(child)} matches completely (${len} character${len === 1 ? '' : 's'}): continue below it, at text[${i + len}] = '${show(text[i + len])}'.`,
          {
            nodes: { [child.id]: 'active' },
            edges: { [child.id]: 'compare' },
            marks: { [child.id]: Array.from({ length: len }, () => 'compare' as Role) },
            text: textRoles(i, i + len, 'done', base),
          },
        );
        i += len;
        node = child;
      } else {
        // Unreachable with a unique terminator (the suffix would equal another one), kept as in the code.
        snap(L.follow, `The suffix ends exactly at the end of the edge '${label(child)}': nothing to add.`, { nodes: { [child.id]: 'good' } });
        return;
      }
    }
  };

  snap(
    L.build,
    `SuffixTree('${original}'): text = '${original}' + the terminator (drawn $), so n = ${n}. The terminator occurs nowhere else, so no suffix is a prefix of another and each one ends at its own leaf. ` +
      `Insert the ${n} suffixes one by one (O(n^2), not Ukkonen).`,
    { nodes: { [root.id]: 'active' } },
  );
  for (let s = 0; s < n; s++) {
    splits = [];
    insertSuffix(s);
    build.push({ tree: dumpSuffixTree(root), splits });
  }
  const built = counts();
  snap(undefined, `Built: ${built.leaves} leaves (one per suffix of '${original}$') and ${built.internal} internal node${built.internal === 1 ? '' : 's'}, where suffixes branch. Every edge stores [start, end] indices into the text, not a copy.`);

  /* ----- search ----- */

  phase = 'search';
  const search = (p: string): number[] => {
    const m = p.length;
    const proles: Record<number, Role> = {};
    snap(L.search, `search('${p}'): walk down from the root, matching the pattern against the edge labels.`, { nodes: { [root.id]: 'active' }, pattern: { p, roles: {} }, result: null });
    let node = root;
    let i = 0;
    const path: Record<string, Role> = {};
    while (i < m) {
      const ch = p[i];
      const child = node.children.get(ch);
      if (!child) {
        proles[i] = 'bad';
        snap(L.noChild, `No edge from ${node === root ? 'the root' : 'this node'} starts with '${ch}': '${p}' does not occur in the text, so search returns [].`, {
          nodes: { ...path, [node.id]: 'bad' },
          edges: path,
          pattern: { p, roles: { ...proles } },
          result: [],
        });
        return [];
      }
      const len = child.end! - child.start! + 1;
      let j = 0;
      while (j < len && i + j < m) {
        if (text[child.start! + j] !== p[i + j]) {
          for (let k = i; k < i + j; k++) proles[k] = 'done';
          proles[i + j] = 'bad';
          snap(
            L.mismatch,
            `Along the edge '${label(child)}' ${range(child)}, '${p[i + j]}' (pattern[${i + j}]) differs from '${show(text[child.start! + j])}' (text[${child.start! + j}]): '${p}' does not occur, so search returns [].`,
            {
              nodes: { ...path, [child.id]: 'bad' },
              edges: { ...path, [child.id]: 'bad' },
              marks: { [child.id]: Array.from({ length: len }, (_, k) => (k < j ? 'compare' : k === j ? 'bad' : undefined)) },
              text: { ...textRoles(child.start!, child.start! + j, 'compare'), [child.start! + j]: 'bad' },
              pattern: { p, roles: { ...proles } },
              result: [],
            },
          );
          return [];
        }
        j++;
      }
      for (let k = i; k < i + j; k++) proles[k] = 'done';
      i += j;
      path[child.id] = 'compare';
      const marks = Array.from({ length: len }, (_, k): Role | undefined => (k < j ? 'compare' : undefined));
      if (i >= m) {
        // _collect_leaf_indices: an explicit stack under the node the pattern ended at (or above).
        const below: Record<string, Role> = {};
        const found: number[] = [];
        const stack = [child];
        while (stack.length) {
          const x = stack.pop()!;
          below[x.id] = x.suffix !== -1 ? 'good' : 'done';
          if (x.suffix !== -1) found.push(x.suffix);
          stack.push(...x.children.values());
        }
        const result = [...found].sort((a, b) => a - b);
        snap(
          L.collect,
          (j < len
            ? `The pattern ends inside the edge '${label(child)}' after ${j} character${j === 1 ? '' : 's'}: every suffix below that edge starts with '${p}'. `
            : `The pattern ends exactly at the end of the edge '${label(child)}'. `) +
            `Collect the suffix index of every leaf below: search returns [${result.join(', ')}], ${result.length === 1 ? 'the one position' : `the ${result.length} positions`} where '${p}' occurs.`,
          {
            nodes: { ...path, ...below },
            edges: { ...path, ...below, [child.id]: 'compare' },
            marks: { [child.id]: marks },
            text: Object.fromEntries(result.flatMap((r) => Array.from({ length: m }, (_, k): [number, Role] => [r + k, 'good']))),
            pattern: { p, roles: { ...proles } },
            result,
          },
        );
        return result;
      }
      snap(
        L.down,
        `The edge '${label(child)}' ${range(child)} matches pattern[${i - j}:${i}] = '${p.slice(i - j, i)}' completely: continue below it with '${p.slice(i)}'.`,
        {
          nodes: { ...path, [child.id]: 'active' },
          edges: path,
          marks: { [child.id]: marks },
          text: textRoles(child.start!, child.end! + 1, 'compare'),
          pattern: { p, roles: { ...proles, [i]: 'active' } },
          result: null,
        },
      );
      node = child;
    }
    snap(L.empty, `The pattern is empty, so the loop never runs: search returns [] (this code defines no matches for the empty pattern).`, { nodes: { [root.id]: 'bad' }, pattern: { p, roles: {} }, result: [] });
    return [];
  };

  for (const p of input.patterns) searches.push([p, search(p)]);
  snap(
    undefined,
    input.patterns.length
      ? `Done: ${searches.map(([p, r]) => `'${p}' at [${r.join(', ')}]`).join('; ')}. Each search cost the pattern length plus the leaves it collected, however long the text.`
      : `Done. Add patterns after a semicolon ("banana; ana na") to search the tree.`,
  );
  return { frames, build, searches };
}
