/**
 * Trie tracer, drawn with MultiwayTreeView (dot nodes, one character per edge, a double ring
 * on a node whose is_end_of_word is set).
 *
 * Mirrors Data_Structures/Non_Linear/Trees/Trie/Python/trie.py, class Trie: insert, search,
 * starts_with, delete (iterative since v0.2.0: it records (parent, char) on the way down, clears
 * the flag, then prunes back up while the node has no children and is not a word, and returns
 * whether the word was stored) and get_all_words (an explicit stack; the children are pushed in
 * reverse so they pop in insertion order).
 * Children are a dict, so they keep insertion order: a pruned child that is inserted again goes
 * to the end. The picture draws children in that order.
 * Golden fixtures (__fixtures__/multiwayTrees.json, section trie) pin the trie and every result.
 *
 * Input: "cat car ?ca ^ca -car words"   (word or +word inserts, ?word searches, ^prefix is
 * starts_with, -word deletes, words is get_all_words; "" is the empty word)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { MwNode, MwState } from '../renderers/MultiwayTreeView';
import type { StripItem } from '../ui/molecules/Strip';

/* ---------- input ---------- */

export type TrieOp = { kind: 'insert' | 'search' | 'prefix' | 'delete'; word: string } | { kind: 'words' };

export const TRIE_LIMITS = { maxOps: 20, wordLength: 7, maxNodes: 30 };

const EXAMPLE = 'Write cat (insert), ?cat (search), ^ca (starts_with), -cat (delete) or words (get_all_words), for example "cat car cart ?car ^ca -car".';

const WORD_KEYS: Record<string, TrieOp['kind']> = {
  insert: 'insert',
  add: 'insert',
  search: 'search',
  find: 'search',
  prefix: 'prefix',
  starts_with: 'prefix',
  startswith: 'prefix',
  delete: 'delete',
  remove: 'delete',
  del: 'delete',
};

function parseWord(token: string, segment: string): string {
  if (token === '""' || token === "''") return '';
  if (!/^[a-z]+$/.test(token)) {
    throw new InputError(
      /^[A-Za-z]+$/.test(token)
        ? `"${segment}": use lowercase letters (the trie is case-sensitive, so "Cat" and "cat" would be different words).`
        : `"${segment}": a word is lowercase letters a to z, or "" for the empty word.`,
    );
  }
  if (token.length > TRIE_LIMITS.wordLength) throw new InputError(`"${segment}": words have at most ${TRIE_LIMITS.wordLength} letters here.`);
  return token;
}

/** Parse "cat car ?ca ^ca -car words". */
export function parseTrie(text: string): TrieOp[] {
  const tokens = text.split(/[\s,;]+/).filter(Boolean);
  const ops: TrieOp[] = [];
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const low = tok.toLowerCase();
    if (low === 'words' || low === 'get_all_words' || low === 'all') {
      ops.push({ kind: 'words' });
      continue;
    }
    const keyword = WORD_KEYS[low];
    if (keyword) {
      const next = tokens[i + 1];
      if (next === undefined) throw new InputError(`"${tok}" needs a word after it, as in "${tok} cat".`);
      ops.push({ kind: keyword, word: parseWord(next, `${tok} ${next}`) });
      i++;
      continue;
    }
    const m = tok.match(/^([+?^-]?)(.*)$/)!;
    const kind: TrieOp['kind'] = m[1] === '?' ? 'search' : m[1] === '^' ? 'prefix' : m[1] === '-' ? 'delete' : 'insert';
    if (!/^[A-Za-z]+$|^""$|^''$/.test(m[2])) throw new InputError(`"${tok}" is not an operation. ${EXAMPLE} Write "" for the empty word.`);
    ops.push({ kind, word: parseWord(m[2], tok) } as TrieOp);
  }
  if (ops.length === 0) throw new InputError(`Add at least one operation. ${EXAMPLE}`);
  if (ops.length > TRIE_LIMITS.maxOps) throw new InputError(`At most ${TRIE_LIMITS.maxOps} operations, please (got ${ops.length}).`);
  // Replay the inserts and deletes so the picture stays a readable size.
  let most = 1;
  const t = new PlainTrie();
  for (const op of ops) {
    if (op.kind === 'insert') t.insert(op.word);
    else if (op.kind === 'delete') t.delete(op.word);
    most = Math.max(most, t.count());
  }
  if (most > TRIE_LIMITS.maxNodes) throw new InputError(`This script grows the trie to ${most} nodes; at most ${TRIE_LIMITS.maxNodes} fit on screen. Use fewer or shorter words.`);
  return ops;
}

interface PlainNode {
  end: boolean;
  children: Map<string, PlainNode>;
}

/** The repository's trie without the frames, for the parser's size check. */
class PlainTrie {
  root: PlainNode = { end: false, children: new Map() };
  insert(word: string) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, { end: false, children: new Map() });
      node = node.children.get(ch)!;
    }
    node.end = true;
  }
  delete(word: string) {
    const path: Array<[PlainNode, string]> = [];
    let node = this.root;
    for (const ch of word) {
      const child = node.children.get(ch);
      if (!child) return;
      path.push([node, ch]);
      node = child;
    }
    if (!node.end) return;
    node.end = false;
    while (path.length && node.children.size === 0 && !node.end) {
      const [parent, ch] = path.pop()!;
      parent.children.delete(ch);
      node = parent;
    }
  }
  count(): number {
    let n = 0;
    const stack = [this.root];
    while (stack.length) {
      const node = stack.pop()!;
      n++;
      stack.push(...node.children.values());
    }
    return n;
  }
}

export const quoteWord = (w: string) => `'${w}'`;

export function formatTrieOp(op: TrieOp): string {
  if (op.kind === 'words') return 'get_all_words()';
  const name = op.kind === 'prefix' ? 'starts_with' : op.kind;
  return `${name}(${quoteWord(op.word)})`;
}

/* ---------- pseudocode (reads like trie.py) ---------- */

export const TRIE_CODE = [
  'insert(word): node = root',
  '  for char in word: if char not in node.children: node.children[char] = TrieNode()',
  '    node = node.children[char]',
  '  node.is_end_of_word = True',
  'search(word): walk the same way; a missing child: return False',
  '  return node.is_end_of_word',
  'starts_with(prefix): walk the same way; a missing child: return False',
  '  return True',
  'delete(word): path = []; walk, appending (node, char); a missing child: return False',
  '  if not node.is_end_of_word: return False',
  '  node.is_end_of_word = False',
  '  while path and not node.children and not node.is_end_of_word:',
  '    parent, char = path.pop(); del parent.children[char]; node = parent',
  '  return True',
  'get_all_words(): stack = [(root, "")]',
  '  while stack: node, prefix = stack.pop(); if node.is_end_of_word: words.append(prefix)',
  '    for char, child in reversed(children): stack.append((child, prefix + char))',
];

const L = {
  insert: 0,
  create: 1,
  move: 2,
  mark: 3,
  search: 4,
  searchEnd: 5,
  prefix: 6,
  prefixEnd: 7,
  delete: 8,
  notWord: 9,
  clear: 10,
  pruneCheck: 11,
  prune: 12,
  deleted: 13,
  words: 14,
  pop: 15,
  push: 16,
};

/* ---------- tracer ---------- */

interface TNode {
  id: string;
  end: boolean;
  children: Map<string, TNode>;
}

/** A node as the fixture stores it: [is_end_of_word, [[char, child], ...]] in dict order. */
export type TrieDump = [boolean, Array<[string, TrieDump]>];

export interface TrieStep {
  op: TrieOp;
  /** insert: null (None); search / starts_with / delete: a boolean; get_all_words: the list. */
  result: boolean | string[] | null;
  trie: TrieDump;
}

export interface TrieRun {
  frames: Array<Frame<MwState>>;
  steps: TrieStep[];
}

interface Snap {
  nodes?: Record<string, Role>;
  edges?: Record<string, Role>;
  ghosts?: Set<string>;
  /** Index of the character being handled; the ones before it are done. */
  at?: number;
  /** Role of the character at `at` (default active). */
  atRole?: Role;
  strips?: Array<{ label: string; items: StripItem[] }>;
  vars?: Array<[string, string | number]>;
}

export function dumpTrie(n: TNode): TrieDump {
  return [n.end, [...n.children].map(([ch, c]): [string, TrieDump] => [ch, dumpTrie(c)])];
}

export function trieTrace(ops: TrieOp[]): TrieRun {
  let serial = 0;
  const newNode = (): TNode => ({ id: `t${serial++}`, end: false, children: new Map() });
  const root: TNode = { id: 'root', end: false, children: new Map() };
  const frames: Array<Frame<MwState>> = [];
  const steps: TrieStep[] = [];
  let current = -1;
  let word: string | null = null;
  /** Node ids on the current walk (drawn in compare, with the edges into them). */
  let walk: TNode[] = [];

  const count = () => {
    let n = 0;
    let words = 0;
    const stack = [root];
    while (stack.length) {
      const node = stack.pop()!;
      n++;
      if (node.end) words++;
      stack.push(...node.children.values());
    }
    return { nodes: n, words };
  };

  const opStrip = () => ({
    label: 'Operations',
    items: ops.map((op, i): StripItem => ({ text: formatTrieOp(op), role: i === current ? 'active' : i < current ? 'muted' : undefined })),
  });

  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const nodes: MwNode[] = [];
    const pathRoles: Record<string, Role> = {};
    for (const n of walk) pathRoles[n.id] = 'compare';
    const visit = (n: TNode, ch: string | null) => {
      const role = o.nodes?.[n.id] ?? pathRoles[n.id];
      nodes.push({
        id: n.id,
        children: [...n.children.values()].map((c) => c.id),
        marked: n.end,
        role,
        ghost: o.ghosts?.has(n.id),
        edge: ch === null ? undefined : { text: ch, role: o.edges?.[n.id] ?? pathRoles[n.id] },
      });
      for (const [c, child] of n.children) visit(child, c);
    };
    visit(root, null);
    const edgeRoles: Record<string, Role> = { ...pathRoles, ...(o.edges ?? {}) };
    delete edgeRoles[root.id];
    const c = count();
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['nodes (with the root)', c.nodes], ['words stored', c.words]],
      state: {
        nodes,
        root: root.id,
        edgeRoles,
        text:
          word === null
            ? undefined
            : {
                label: word === '' ? "word ''" : 'word',
                cells: [...word].map((ch, i) => ({ ch, role: o.at === undefined ? undefined : i < o.at ? 'done' : i === o.at ? (o.atRole ?? 'active') : undefined })),
              },
        strips: [opStrip(), ...(o.strips ?? [])],
      },
    });
  };

  /** Walk down the word; returns the nodes reached, or the index of the first missing character. */
  const walkDown = (w: string, line: number, missLine: number, verb: string): { node: TNode; path: Array<[TNode, string]> } | null => {
    let node = root;
    const path: Array<[TNode, string]> = [];
    walk = [root];
    for (let i = 0; i < w.length; i++) {
      const ch = w[i];
      const child = node.children.get(ch);
      if (!child) {
        const have = [...node.children.keys()];
        snap(
          missLine,
          `'${ch}' is not a child of ${i === 0 ? 'the root' : `the node for '${w.slice(0, i)}'`}${have.length ? ` (it has ${have.map((x) => `'${x}'`).join(', ')})` : ' (it has no children)'}: no stored word continues this way, so ${verb} returns False.`,
          { nodes: { [node.id]: 'bad' }, at: i, atRole: 'bad' },
        );
        return null;
      }
      path.push([node, ch]);
      walk.push(child);
      snap(line, `'${ch}' is a child of ${i === 0 ? 'the root' : `the node for '${w.slice(0, i)}'`}: move down to the node for '${w.slice(0, i + 1)}'.`, {
        nodes: { [child.id]: 'active' },
        edges: { [child.id]: 'active' },
        at: i,
      });
      node = child;
    }
    return { node, path };
  };

  const insert = (w: string) => {
    let node = root;
    walk = [root];
    snap(L.insert, `insert(${quoteWord(w)}): node = root. Follow the word one character at a time, creating the nodes that are missing.`, { nodes: { [root.id]: 'active' }, at: w.length ? 0 : undefined });
    for (let i = 0; i < w.length; i++) {
      const ch = w[i];
      let child = node.children.get(ch);
      if (!child) {
        child = newNode();
        node.children.set(ch, child);
        walk.push(child);
        snap(
          L.create,
          `'${ch}' is not a child of ${i === 0 ? 'the root' : `the node for '${w.slice(0, i)}'`}: create a new node for '${w.slice(0, i + 1)}'` +
            (i > 0 && node.children.size > 1 ? `, beside ${[...node.children.keys()].filter((x) => x !== ch).map((x) => `'${x}'`).join(', ')}: the words share the prefix '${w.slice(0, i)}'.` : '.'),
          { nodes: { [child.id]: 'active' }, edges: { [child.id]: 'active' }, at: i },
        );
      } else {
        walk.push(child);
        snap(L.move, `'${ch}' already has a node (the prefix '${w.slice(0, i + 1)}' is shared with a stored word): just move down, nothing is created.`, {
          nodes: { [child.id]: 'compare' },
          edges: { [child.id]: 'compare' },
          at: i,
        });
      }
      node = child;
    }
    const was = node.end;
    node.end = true;
    snap(
      L.mark,
      was
        ? `The node for ${quoteWord(w)} already ends a word: setting is_end_of_word again changes nothing (a trie stores each word once).`
        : w === ''
          ? `is_end_of_word = True on the root itself (the double ring): the empty word is stored, so the trie is no longer empty.`
          : `is_end_of_word = True on the node for ${quoteWord(w)} (the double ring)` +
            (node.children.size ? `: the node continues to longer words too, so only the flag tells that ${quoteWord(w)} is stored.` : '.'),
      { nodes: { [node.id]: 'done' }, at: w.length },
    );
  };

  const search = (w: string): boolean => {
    walk = [root];
    snap(L.search, `search(${quoteWord(w)}): walk the path for ${quoteWord(w)} from the root.`, { nodes: { [root.id]: 'active' }, at: w.length ? 0 : undefined });
    const got = walkDown(w, L.search, L.search, 'search');
    if (!got) return false;
    const { node } = got;
    snap(
      L.searchEnd,
      node.end
        ? `The path exists and its last node ends a word: search returns True.`
        : `The path exists, but its last node does not end a word (no double ring): ${quoteWord(w)} is only a prefix of stored words, so search returns False.`,
      { nodes: { [node.id]: node.end ? 'good' : 'bad' }, at: w.length },
    );
    return node.end;
  };

  const startsWith = (w: string): boolean => {
    walk = [root];
    snap(L.prefix, `starts_with(${quoteWord(w)}): walk the path for ${quoteWord(w)}; the end-of-word flag does not matter here.`, { nodes: { [root.id]: 'active' }, at: w.length ? 0 : undefined });
    const got = walkDown(w, L.prefix, L.prefix, 'starts_with');
    if (!got) return false;
    const below: Record<string, Role> = {};
    const words: string[] = [];
    const stack: Array<[TNode, string]> = [[got.node, w]];
    while (stack.length) {
      const [n, p] = stack.pop()!;
      below[n.id] = 'done';
      if (n.end) words.push(p);
      [...n.children].reverse().forEach(([ch, c]) => stack.push([c, p + ch]));
    }
    below[got.node.id] = 'good';
    snap(
      L.prefixEnd,
      `The whole prefix is a path, so starts_with returns True. Every stored word below this node starts with ${quoteWord(w)}: ${words.length ? words.map(quoteWord).join(', ') : 'none yet'}.`,
      { nodes: below, edges: below, at: w.length },
    );
    return true;
  };

  const del = (w: string): boolean => {
    walk = [root];
    snap(L.delete, `delete(${quoteWord(w)}): walk down, remembering (parent, char) for every step, so the walk back up needs no recursion.`, {
      nodes: { [root.id]: 'active' },
      at: w.length ? 0 : undefined,
    });
    const got = walkDown(w, L.delete, L.delete, 'delete');
    if (!got) return false;
    let { node } = got;
    const { path } = got;
    if (!node.end) {
      snap(L.notWord, `The path exists, but the node for ${quoteWord(w)} does not end a word: ${quoteWord(w)} was never stored, so delete returns False and nothing changes.`, {
        nodes: { [node.id]: 'bad' },
        at: w.length,
      });
      return false;
    }
    node.end = false;
    snap(
      L.clear,
      `is_end_of_word = False: ${quoteWord(w)} is no longer a word.` +
        (node.children.size ? ` The node still leads to longer words, so it stays and nothing is pruned.` : path.length ? ` The node has no children and ends no word now, so it can be pruned.` : ''),
      { nodes: { [node.id]: 'active' }, at: w.length },
    );
    while (path.length && node.children.size === 0 && !node.end) {
      const [parent, ch] = path.pop()!;
      const gone = node;
      snap(L.prune, `The node for '${w.slice(0, path.length + 1)}' has no children and is not a word: del parent.children['${ch}'], then continue from the parent.`, {
        nodes: { [gone.id]: 'bad', [parent.id]: 'compare' },
        edges: { [gone.id]: 'bad' },
        ghosts: new Set([gone.id]),
        at: path.length,
        atRole: 'bad',
      });
      parent.children.delete(ch);
      walk = walk.filter((n) => n !== gone);
      node = parent;
    }
    const reason = !path.length
      ? 'the path is empty (the root is never removed)'
      : node.end
        ? `the node for '${w.slice(0, path.length)}' is itself a word`
        : `the node for '${w.slice(0, path.length)}' still has ${node.children.size === 1 ? 'a child' : 'children'} (${[...node.children.keys()].map((x) => `'${x}'`).join(', ')})`;
    snap(L.deleted, `Pruning stops: ${reason}. delete returns True: the word was stored and is gone.`, { nodes: { [node.id]: 'good' }, at: w.length });
    return true;
  };

  const allWords = (): string[] => {
    walk = [];
    const words: string[] = [];
    const stack: Array<[TNode, string]> = [[root, '']];
    const stackStrip = () => ({ label: 'Stack (top last)', items: stack.map(([, p]): StripItem => ({ text: quoteWord(p) })) });
    const wordStrip = () => ({ label: 'Words', items: words.map((x): StripItem => ({ text: quoteWord(x), role: 'good' })) });
    snap(L.words, `get_all_words(): an explicit stack of (node, prefix) pairs, starting with (root, ''). No recursion, so very long words are fine.`, {
      nodes: { [root.id]: 'compare' },
      strips: [stackStrip(), wordStrip()],
    });
    const seen: Record<string, Role> = {};
    while (stack.length) {
      const [node, prefix] = stack.pop()!;
      if (node.end) words.push(prefix);
      [...node.children].reverse().forEach(([ch, c]) => stack.push([c, prefix + ch]));
      snap(
        node.end ? L.pop : L.push,
        `Pop (${prefix === '' ? 'root' : `node`}, ${quoteWord(prefix)}).` +
          (node.end ? ` It ends a word: append ${quoteWord(prefix)}.` : '') +
          (node.children.size
            ? node.children.size === 1
              ? ` Push its child ('${[...node.children.keys()][0]}'), which is popped next.`
              : ` Push its ${node.children.size} children in reverse (${[...node.children.keys()].reverse().map((x) => `'${x}'`).join(', ')}), so the first one, '${[...node.children.keys()][0]}', is popped next.`
            : ' It has no children.'),
        { nodes: { ...seen, [node.id]: node.end ? 'good' : 'active' }, strips: [stackStrip(), wordStrip()] },
      );
      seen[node.id] = 'done';
    }
    return words;
  };

  snap(undefined, `Trie(): just the root, which stands for the empty prefix. A path from the root spells a prefix; a double ring marks a node whose prefix is a stored word.`);

  ops.forEach((op, idx) => {
    current = idx;
    walk = [];
    let result: TrieStep['result'] = null;
    if (op.kind === 'words') {
      word = null;
      result = allWords();
    } else {
      word = op.word;
      if (op.kind === 'insert') insert(op.word);
      else if (op.kind === 'search') result = search(op.word);
      else if (op.kind === 'prefix') result = startsWith(op.word);
      else result = del(op.word);
    }
    steps.push({ op, result, trie: dumpTrie(root) });
  });

  current = ops.length;
  walk = [];
  word = null;
  const c = count();
  snap(undefined, `Done: ${c.words} word${c.words === 1 ? '' : 's'} in ${c.nodes} nodes (with the root). Words with a common prefix share its nodes.`);
  return { frames, steps };
}
