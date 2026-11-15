/**
 * Aho-Corasick tracer, drawn with AhoCorasickView (the trie, dashed failure links, dotted
 * output links, and a row with the pattern being inserted or the text being scanned).
 *
 * Mirrors Algorithms/String_Algorithms/Advanced_String/Aho_Corasick/Python/aho_corasick.py,
 * class AhoCorasick:
 *   __init__   skips empty patterns ("if pattern:") and inserts the others in order;
 *   _insert    walks the trie, creating a node for every missing character; the last node
 *              appends the pattern to its patterns list (a duplicate is appended twice);
 *   _build_failure_links  BFS from the root's children (they fail to the root); for every
 *              child of the popped node, walk the failure chain of the parent until a node has
 *              the child's character (root.fail is None ends the walk), then set output to the
 *              failure target if it ends a pattern, else to the target's own output link;
 *   search     for each character, follow failure links while the node is not the root and has
 *              no edge for it, take the edge if there is one, and report the node's patterns,
 *              then the patterns along its output links, as (index, pattern).
 * Children are a dict, so they keep insertion order; the BFS and the picture use that order.
 * Every `char in node.children` test is logged (buildChecks, scanChecks), and the golden
 * fixtures (__fixtures__/advancedStrings.json, section aho) pin that log, the trie with its
 * links, and the matches in the order search returns them.
 *
 * Input: "he she his hers | ushers"   (patterns separated by spaces or commas, "" is the empty pattern)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { AcLinkView, AcNodeView, AcState, AcTextRow } from '../renderers/AhoCorasickView';
import type { StripData, StripItem } from '../ui/molecules/Strip';

/* ---------- input ---------- */

export interface AcInput {
  patterns: string[];
  text: string;
}

export const AC_LIMITS = { maxPatterns: 8, patternLength: 6, maxNodes: 24, textLength: 20 };

const EXAMPLE = '"he she his hers | ushers"';

/** Nodes below the root that inserting these patterns creates. */
export function trieSize(patterns: string[]): number {
  const seen = new Set<string>();
  for (const p of patterns) {
    let prefix = '';
    for (const ch of Array.from(p)) {
      prefix += ch;
      seen.add(prefix);
    }
  }
  return seen.size;
}

/** Parse "he she his hers | ushers": the patterns, a "|", then the text (either side may be empty). */
export function parseAho(input: string): AcInput {
  const bar = input.indexOf('|');
  if (bar === -1) throw new InputError(`Write the patterns, a "|" and the text, for example ${EXAMPLE}.`);
  if (input.indexOf('|', bar + 1) !== -1) throw new InputError('Use a single "|" between the patterns and the text.');
  const patterns = input
    .slice(0, bar)
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((t) => (t === '""' || t === "''" ? '' : t));
  if (patterns.length > AC_LIMITS.maxPatterns) throw new InputError(`At most ${AC_LIMITS.maxPatterns} patterns, please (got ${patterns.length}).`);
  for (const p of patterns) {
    if (Array.from(p).length > AC_LIMITS.patternLength) throw new InputError(`Patterns have at most ${AC_LIMITS.patternLength} characters here (got "${p}").`);
  }
  const size = trieSize(patterns);
  if (size > AC_LIMITS.maxNodes) throw new InputError(`These patterns make a trie of ${size} nodes; at most ${AC_LIMITS.maxNodes} fit on screen. Use fewer or shorter patterns.`);
  const text = input.slice(bar + 1).trim();
  if (Array.from(text).length > AC_LIMITS.textLength) throw new InputError(`Keep the text to ${AC_LIMITS.textLength} characters (got ${Array.from(text).length}).`);
  return { patterns, text };
}

/* ---------- pseudocode ---------- */

export const AC_CODE = [
  '__init__(patterns): root = _Node()',
  '  for pattern in patterns: if pattern: _insert(pattern)',
  '_insert(pattern): node = root',
  '  for char in pattern:',
  '    if char not in node.children: node.children[char] = _Node()',
  '    node = node.children[char]',
  '  node.patterns.append(pattern)',
  '_build_failure_links(): for child in root.children.values(): child.fail = root; queue.append(child)',
  '  while queue: current = queue.popleft()',
  '    for char, next_node in current.children.items():',
  '      fail_candidate = current.fail',
  '      while fail_candidate is not None and char not in fail_candidate.children: fail_candidate = fail_candidate.fail',
  '      if fail_candidate and char in fail_candidate.children and fail_candidate.children[char] is not next_node:',
  '        next_node.fail = fail_candidate.children[char]',
  '      else: next_node.fail = root',
  '      next_node.output = next_node.fail if next_node.fail.patterns else next_node.fail.output',
  '      queue.append(next_node)',
  'search(text): node = root',
  '  for i, char in enumerate(text):',
  '    while node is not root and char not in node.children: node = node.fail',
  '    if char in node.children: node = node.children[char]',
  '    for pattern in node.patterns: matches.append((i, pattern))',
  '    out = node.output',
  '    while out is not None: report out.patterns as (i, pattern); out = out.output',
  '  return matches',
];

const L = {
  init: 0,
  skip: 1,
  insert: 2,
  create: 4,
  follow: 5,
  append: 6,
  depth1: 7,
  pop: 8,
  candidate: 10,
  walk: 11,
  failSet: 13,
  failRoot: 14,
  output: 15,
  search: 17,
  fallBack: 19,
  step: 20,
  report: 21,
  outLink: 23,
  done: 24,
};

/* ---------- tracer ---------- */

interface TNode {
  id: number;
  ch: string;
  name: string;
  parent: number | null;
  children: Map<string, number>;
  fail: number | null;
  output: number | null;
  patterns: string[];
}

/** [node id, char, result] of one `char in node.children` test. */
export type AcCheck = [number, string, boolean];

/** A node as the fixtures dump it: [parent, char, fail, output, patterns, children]. */
export type AcNodeDump = [number | null, string, number | null, number | null, string[], number[]];

export interface AcRun {
  frames: Array<Frame<AcState>>;
  nodes: AcNodeDump[];
  buildChecks: AcCheck[];
  scanChecks: AcCheck[];
  matches: Array<[number, string]>;
  /** The current node after each character of the text. */
  states: number[];
}

type Vars = Array<[string, string | number]>;

interface View {
  nodes?: Record<number, Role>;
  edges?: Record<number, Role>;
  /** Roles of drawn links, keyed "fail:<id>" or "output:<id>". */
  links?: Record<string, Role>;
  /** Failure links to the root are drawn only while they matter. */
  rootLinks?: Array<{ from: number; role: Role }>;
  text?: AcTextRow;
  vars?: Vars;
}

const repr = (p: string) => `'${p}'`;

/** The matches strip shows the latest ones only, so a run with many overlapping matches keeps its size. */
const MATCHES_SHOWN = 10;

export function acTrace(input: AcInput): AcRun {
  const patterns = input.patterns;
  const text = Array.from(input.text);
  const nodes: TNode[] = [];
  const frames: Array<Frame<AcState>> = [];
  const buildChecks: AcCheck[] = [];
  const scanChecks: AcCheck[] = [];
  const matches: Array<[number, string]> = [];
  const states: number[] = [];
  let checks = buildChecks;
  let phase: 'build' | 'bfs' | 'scan' = 'build';
  let currentPattern = -1;
  let queue: number[] = [];

  const newNode = (ch: string, parent: number | null): number => {
    const id = nodes.length;
    nodes.push({ id, ch, name: parent === null ? '' : nodes[parent].name + ch, parent, children: new Map(), fail: null, output: null, patterns: [] });
    return id;
  };
  /** `char in node.children`, logged like the recording dicts of the fixture generator. */
  const has = (id: number, ch: string): boolean => {
    const r = nodes[id].children.has(ch);
    checks.push([id, ch, r]);
    return r;
  };
  const nm = (id: number) => (id === 0 ? 'the root' : `'${nodes[id].name}'`);
  const Nm = (id: number) => (id === 0 ? 'The root' : `'${nodes[id].name}'`);

  const patternStrip = (): StripData => ({
    label: 'Patterns',
    items: patterns.length
      ? patterns.map((p, k): StripItem => ({ text: repr(p), role: phase === 'build' ? (k === currentPattern ? 'active' : k < currentPattern ? 'done' : undefined) : undefined }))
      : [{ text: 'none' }],
  });
  const secondStrip = (): StripData =>
    phase === 'scan'
      ? {
          label: 'Matches',
          items: matches.length
            ? [
                ...(matches.length > MATCHES_SHOWN ? [{ text: `${matches.length - MATCHES_SHOWN} earlier` }] : []),
                ...matches.slice(-MATCHES_SHOWN).map(([i, p]): StripItem => ({ text: `(${i}, ${repr(p)})`, role: 'done' })),
              ]
            : [{ text: 'none yet' }],
        }
      : { label: 'Queue', items: phase === 'build' ? [{ text: 'not started' }] : queue.length ? queue.map((id): StripItem => ({ text: nm(id) })) : [{ text: 'empty' }] };

  const snap = (line: number | undefined, caption: string, v: View = {}) => {
    const views: AcNodeView[] = nodes.map((n) => ({
      id: n.id,
      children: [...n.children.values()],
      ch: n.ch,
      name: n.name,
      patterns: n.patterns.length,
      role: v.nodes?.[n.id],
    }));
    const links: AcLinkView[] = [];
    for (const n of nodes) {
      if (n.fail !== null && n.fail !== 0) links.push({ from: n.id, to: n.fail, kind: 'fail', role: v.links?.[`fail:${n.id}`] });
    }
    for (const r of v.rootLinks ?? []) links.push({ from: r.from, to: 0, kind: 'fail', role: r.role });
    for (const n of nodes) {
      if (n.output !== null) links.push({ from: n.id, to: n.output, kind: 'output', role: v.links?.[`output:${n.id}`] });
    }
    frames.push({
      line,
      caption,
      vars: [...(v.vars ?? []), ['nodes', nodes.length]],
      state: {
        nodes: views,
        links,
        edgeRoles: v.edges,
        text: v.text,
        note: 'Solid: trie edges. Dashed: failure links (a node without one fails to the root). Dotted: output links.',
        strips: [patternStrip(), secondStrip()],
      },
    });
  };

  /* ---------- phase 1: the trie ---------- */
  const root = newNode('', null);
  snap(
    L.init,
    `AhoCorasick(${patterns.length ? `[${patterns.map(repr).join(', ')}]` : '[]'}) starts with an empty root. Phase 1 inserts every non-empty pattern into a trie, ` +
      'phase 2 gives every node a failure link (to its longest proper suffix that is also in the trie) in BFS order, and phase 3 reads the text once.',
    { nodes: { [root]: 'active' } },
  );

  patterns.forEach((pattern, k) => {
    currentPattern = k;
    const chars = Array.from(pattern);
    const row = (at: number, done = false): AcTextRow => ({
      label: 'pattern',
      cells: chars.map((ch, j) => ({ ch, role: done ? 'done' : j === at ? 'active' : j < at ? 'compare' : undefined })),
    });
    if (!pattern) {
      snap(L.skip, `Pattern ${k + 1} is the empty string: "if pattern:" is false, so it is skipped and can never be reported.`, { vars: [['pattern', "''"]] });
      return;
    }
    let node = root;
    const path: Record<number, Role> = {};
    snap(L.insert, `_insert(${repr(pattern)}): start at the root and walk down one character at a time, creating every node that is missing.`, {
      nodes: { [root]: 'active' },
      text: row(-1),
      vars: [['pattern', repr(pattern)]],
    });
    chars.forEach((ch, j) => {
      const created = !has(node, ch);
      if (created) nodes[node].children.set(ch, newNode(ch, node));
      const child = nodes[node].children.get(ch)!;
      const caption = created
        ? `'${ch}' is not a child of ${nm(node)}: create node '${nodes[child].name}' and move to it.`
        : `'${ch}' is already a child of ${nm(node)}: an earlier pattern shares the prefix '${nodes[child].name}', so follow the existing edge.`;
      path[child] = 'compare';
      node = child;
      snap(created ? L.create : L.follow, caption, {
        nodes: { ...path, [root]: 'compare', [child]: 'active' },
        edges: { ...Object.fromEntries(Object.keys(path).map((id) => [id, 'compare'])), [child]: 'active' },
        text: row(j),
        vars: [['pattern', repr(pattern)], ['char', `'${ch}'`], ['node', nm(node)]],
      });
    });
    const before = nodes[node].patterns.length;
    nodes[node].patterns.push(pattern);
    const inner = nodes[node].children.size > 0;
    snap(
      L.append,
      before > 0
        ? `Node '${nodes[node].name}' already holds ${repr(pattern)}: the duplicate is appended again (patterns has ${before + 1} entries), so every occurrence will be reported ${before + 1} times.`
        : `${repr(pattern)} ends at node '${nodes[node].name}': append it to that node's patterns (the double ring)${inner ? '. It is an inner node: a pattern can be a prefix of another one' : ''}.`,
      {
        nodes: { [node]: 'done' },
        text: row(chars.length, true),
        vars: [['pattern', repr(pattern)], ['node', nm(node)]],
      },
    );
  });
  currentPattern = patterns.length;

  /* ---------- phase 2: failure and output links ---------- */
  phase = 'bfs';
  const depth1 = [...nodes[root].children.values()];
  for (const child of depth1) {
    nodes[child].fail = root;
    queue.push(child);
  }
  snap(
    L.depth1,
    depth1.length
      ? `Phase 2. A node's failure link goes to the longest proper suffix of its string that is also in the trie. The ${depth1.length} child${depth1.length === 1 ? '' : 'ren'} of the root ` +
          `(${depth1.map(nm).join(', ')}) ha${depth1.length === 1 ? 's' : 've'} only the empty suffix, so ${depth1.length === 1 ? 'it fails' : 'they fail'} to the root and start${depth1.length === 1 ? 's' : ''} the BFS queue.`
      : 'Phase 2. No pattern was inserted, so the trie is just the root: there is nothing to link and the queue stays empty.',
    {
      nodes: Object.fromEntries(depth1.map((id) => [id, 'active'])),
      rootLinks: depth1.map((from) => ({ from, role: 'active' as Role })),
    },
  );

  while (queue.length) {
    const current = queue.shift()!;
    const kids = [...nodes[current].children.entries()];
    snap(
      L.pop,
      kids.length
        ? `Pop ${nm(current)}. BFS order means every shallower node already has its failure link, so the ${kids.length} child${kids.length === 1 ? '' : 'ren'} of ${nm(current)} can get theirs now.`
        : `Pop ${nm(current)}: it has no children, so there is nothing to link.`,
      { nodes: { [current]: 'active' }, vars: [['current', nm(current)]] },
    );
    for (const [ch, next] of kids) {
      let cand: number | null = nodes[current].fail;
      const parentLink = (role: Role): View =>
        nodes[current].fail === root ? { rootLinks: [{ from: current, role }] } : { links: { [`fail:${current}`]: role } };
      const base: Vars = [['current', nm(current)], ['char', `'${ch}'`], ['next_node', nm(next)]];
      snap(
        L.candidate,
        `Child '${nodes[next].name}' (by '${ch}'). Its longest proper suffix in the trie is a suffix of '${nodes[current].name}' extended by '${ch}'. ` +
          `Start with fail_candidate = fail[${nm(current)}] = ${nm(cand!)} and look for a child '${ch}' there.`,
        { nodes: { [current]: 'active', [next]: 'active', [cand!]: 'compare' }, edges: { [next]: 'active' }, ...parentLink('compare'), vars: [...base, ['fail_candidate', nm(cand!)]] },
      );
      while (cand !== null && !has(cand, ch)) {
        const up: number | null = nodes[cand].fail;
        const view: View = { nodes: { [next]: 'active', [cand]: 'bad' }, edges: { [next]: 'active' }, vars: [...base, ['fail_candidate', up === null ? 'None' : nm(up)]] };
        if (up === null) {
          snap(L.walk, `${Nm(cand)} has no child '${ch}' either, and root.fail is None, so the walk stops: no suffix of '${nodes[current].name}' can be extended by '${ch}'.`, view);
        } else {
          if (up === root) view.rootLinks = [{ from: cand, role: 'compare' }];
          else view.links = { [`fail:${cand}`]: 'compare' };
          view.nodes![up] = 'compare';
          snap(L.walk, `${Nm(cand)} has no child '${ch}': try the next shorter suffix, its failure link ${nm(up)}.`, view);
        }
        cand = up;
      }
      const hit = cand !== null && has(cand, ch) && nodes[cand].children.get(ch) !== next;
      nodes[next].fail = hit ? nodes[cand!].children.get(ch)! : root;
      const f = nodes[next].fail!;
      nodes[next].output = nodes[f].patterns.length ? f : nodes[f].output;
      queue.push(next);
      const out = nodes[next].output;
      const outText =
        out === null
          ? ` ${Nm(f)} ends no pattern and has no output link, so output['${nodes[next].name}'] stays None.`
          : '';
      snap(
        hit ? L.failSet : L.failRoot,
        (hit
          ? `${Nm(cand!)} has a child '${ch}', so fail['${nodes[next].name}'] = ${nm(f)}: the longest proper suffix of '${nodes[next].name}' that is also in the trie.`
          : `So fail['${nodes[next].name}'] = the root: no proper suffix of '${nodes[next].name}' is in the trie.`) +
          outText +
          ` Enqueue ${nm(next)}.`,
        {
          nodes: { [next]: 'active', [f]: 'done' },
          ...(f === root ? { rootLinks: [{ from: next, role: 'active' as Role }] } : { links: { [`fail:${next}`]: 'active' } }),
          vars: [...base, ['fail', nm(f)], ['output', out === null ? 'None' : nm(out)]],
        },
      );
      if (out !== null) {
        snap(
          L.output,
          out === f
            ? `${Nm(f)} ends a pattern, so output['${nodes[next].name}'] = ${nm(f)}: whenever the scan reaches ${nm(next)}, it must also report ${nodes[f].patterns.map(repr).join(', ')}.`
            : `${Nm(f)} ends no pattern, but its own output link points to ${nm(out)}, so output['${nodes[next].name}'] = ${nm(out)}: the nearest suffix that ends a pattern.`,
          {
            nodes: { [next]: 'active', [out]: 'done' },
            links: { [`output:${next}`]: 'active', ...(f !== root && f !== out ? { [`fail:${next}`]: 'compare' } : {}) },
            vars: [...base, ['fail', nm(f)], ['output', nm(out)]],
          },
        );
      }
    }
  }

  /* ---------- phase 3: search ---------- */
  phase = 'scan';
  checks = scanChecks;
  const textRow = (i: number, span?: [number, number]): AcTextRow => ({
    label: 'text',
    cells: text.map((ch, k) => ({ ch, role: span && k >= span[0] && k <= span[1] ? 'done' : k === i ? 'active' : k < i ? 'muted' : undefined })),
  });
  let node = root;
  snap(
    L.search,
    text.length
      ? `Phase 3: search('${input.text}'). Start at the root. For every character, fall back along failure links until the current node has an edge for it, then take the edge. ` +
          'The current node is always the longest suffix of the text read so far that is in the trie.'
      : 'Phase 3: search(\'\'). The text is empty, so the loop never runs and search returns [].',
    { nodes: { [root]: 'active' }, text: textRow(-1), vars: [['node', nm(root)]] },
  );
  text.forEach((ch, i) => {
    const vars = (): Vars => [['i', i], ['char', `'${ch}'`], ['node', nm(node)], ['matches', matches.length]];
    let first = true;
    const lead = () => (first ? `Read text[${i}] = '${ch}'. ` : '');
    while (node !== root && !has(node, ch)) {
      const from = node;
      node = nodes[node].fail!;
      snap(
        L.fallBack,
        `${lead()}${Nm(from)} has no child '${ch}': fall back along its failure link to ${nm(node)}` +
          (node === root ? ', the empty suffix.' : `, keeping the '${nodes[node].name}' that is already matched.`),
        {
          nodes: { [node]: 'active', [from]: 'bad' },
          ...(node === root ? { rootLinks: [{ from, role: 'compare' as Role }] } : { links: { [`fail:${from}`]: 'compare' } }),
          text: textRow(i),
          vars: vars(),
        },
      );
      first = false;
    }
    const quiet = (id: number) => nodes[id].patterns.length === 0 && nodes[id].output === null;
    if (has(node, ch)) {
      const from = node;
      node = nodes[node].children.get(ch)!;
      snap(
        L.step,
        `${lead()}${Nm(from)} has a child '${ch}': move to ${nm(node)}.${quiet(node) ? ' No pattern ends here and there is no output link, so nothing is reported.' : ''}`,
        { nodes: { [node]: 'active' }, edges: { [node]: 'active' }, text: textRow(i), vars: vars() },
      );
    } else {
      snap(L.step, `${lead()}The root has no child '${ch}' either, so the scan stays at the root: no pattern ends at index ${i}.`, {
        nodes: { [node]: 'active' },
        text: textRow(i),
        vars: vars(),
      });
    }
    first = false;
    states.push(node);
    const span = (p: string): [number, number] => [i - Array.from(p).length + 1, i];
    const ps = nodes[node].patterns;
    if (ps.length) {
      for (const p of ps) matches.push([i, p]);
      snap(
        L.report,
        ps.length === 1
          ? `${Nm(node)} ends the pattern ${repr(ps[0])}: report (${i}, ${repr(ps[0])}). It started at index ${i - Array.from(ps[0]).length + 1}.`
          : `${Nm(node)} holds ${ps.length} copies of ${repr(ps[0])}: report (${i}, ${repr(ps[0])}) ${ps.length} times.`,
        { nodes: { [node]: 'done' }, text: textRow(i, span(ps[0])), vars: vars() },
      );
    }
    let out = nodes[node].output;
    let from = node;
    while (out !== null) {
      const ops = nodes[out].patterns;
      for (const p of ops) matches.push([i, p]);
      snap(
        L.outLink,
        `Follow the output link of ${nm(from)} to ${nm(out)}, a shorter suffix that ends a pattern: report ${ops.map((p) => `(${i}, ${repr(p)})`).join(', ')}.` +
          (nodes[out].output === null ? ` ${Nm(out)} has no output link, so the reporting for index ${i} ends.` : ''),
        { nodes: { [node]: 'active', [out]: 'done' }, links: { [`output:${from}`]: 'active' }, text: textRow(i, span(ops[0])), vars: vars() },
      );
      from = out;
      out = nodes[out].output;
    }
  });
  snap(
    text.length ? L.done : undefined,
    `Done: ${matches.length} match${matches.length === 1 ? '' : 'es'}${matches.length ? `, ${matches.map(([i, p]) => `(${i}, ${repr(p)})`).join(', ')}` : ''}. ` +
      'Each index is where a match ends. Every character moved down at most one trie edge and every failure hop moved up, so the scan is O(n + z).',
    { text: textRow(text.length), vars: [['matches', matches.length]] },
  );

  return {
    frames,
    nodes: nodes.map((n): AcNodeDump => [n.parent, n.ch, n.fail, n.output, [...n.patterns], [...n.children.values()]]),
    buildChecks,
    scanChecks,
    matches,
    states,
  };
}
