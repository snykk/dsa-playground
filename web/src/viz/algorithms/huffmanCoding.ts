/**
 * Huffman coding tracer, drawn with HuffmanForest: the heap list of trees, the forest of those
 * trees in heap order, then the code table and the encoded bits.
 *
 * Mirrors Algorithms/Greedy/Huffman_Coding/Python/huffman_coding.py:
 *   build_huffman_tree: Counter(text) (symbols in order of first appearance), one heappush per
 *     leaf, then while len(heap) > 1: left = heappop, right = heappop, push
 *     HuffmanNode(freq=left.freq + right.freq, left=left, right=right);
 *   build_codes: left adds '0', right adds '1', a lone leaf gets '0';
 *   huffman_encode: ''.join(codes[c] for c in text);
 *   calculate_compression_ratio: len(encoded) / (len(text) * 8), savings = (1 - ratio) * 100.
 * HuffmanNode.__lt__ compares frequencies only, so ties are broken by Python's heapq itself:
 * heappush sifts the new entry up while it is strictly smaller than its parent; heappop moves
 * the last entry to the root, moves the smaller child up all the way to a leaf (the right child
 * unless the left one is strictly smaller) and then sifts the entry back up. heapPush and heapPop
 * below follow heapq's _siftdown and _siftup move for move.
 * Golden fixtures (__fixtures__/greedyAndField.json) pin every heap after every push and pop,
 * the code table in dict order, the encoded bits and the ratio.
 *
 * Input: "abracadabra", a quoted text such as "to be or not to be" (or "" for the empty text),
 * or frequencies "freq a:45, b:13, c:12" (the text 'a' * 45 + 'b' * 13 + 'c' * 12).
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { HuffmanState, HuffNodeView } from '../renderers/HuffmanForest';
import { SYM } from '../ui/symbols';

/* ---------- input ---------- */

export interface HuffmanInput {
  text: string;
  /** Set for the frequency form: each symbol and its count, in the order given. */
  runs?: Array<[string, number]>;
}

export const HUFFMAN_LIMITS = { maxText: 64, maxRunsText: 100, maxCount: 99, maxSymbols: 12 };

const PRINTABLE = /^[\x20-\x7e]*$/;

function checkSymbols(text: string) {
  if (!PRINTABLE.test(text)) throw new InputError('Use printable ASCII characters only (letters, digits, spaces and punctuation).');
  const distinct = new Set(text).size;
  if (distinct > HUFFMAN_LIMITS.maxSymbols) {
    throw new InputError(`At most ${HUFFMAN_LIMITS.maxSymbols} different symbols, so every leaf fits on screen (got ${distinct}).`);
  }
}

/**
 * "abracadabra", "\"to be or not to be\"" (quotes keep spaces at the ends; "" is the empty
 * text) or "freq a:45, b:13" (the text 'a' * 45 + 'b' * 13, as the Python test builds it).
 */
export function parseHuffman(raw: string): HuffmanInput {
  const trimmed = raw.replace(/^[\r\n]+|[\r\n]+$/g, '').trim();
  const freq = trimmed.match(/^freq(?:uencies)?\s*[:=]?\s*(.*)$/is);
  if (freq) {
    const tokens = freq[1].split(/[\s,;]+/).filter(Boolean);
    if (tokens.length === 0) throw new InputError('After "freq", list symbols with their counts, as in "freq a:45, b:13, c:12".');
    const runs: Array<[string, number]> = [];
    for (const t of tokens) {
      const m = t.match(/^(\S)[:=](\d+)$/);
      if (!m) throw new InputError(`"${t}" is not a symbol with a count: write it like a:45.`);
      const n = Number(m[2]);
      if (n < 1 || n > HUFFMAN_LIMITS.maxCount) throw new InputError(`Counts go from 1 to ${HUFFMAN_LIMITS.maxCount} (got ${t}).`);
      if (runs.some(([s]) => s === m[1])) throw new InputError(`The symbol "${m[1]}" appears twice; give each symbol once.`);
      runs.push([m[1], n]);
    }
    const text = runs.map(([s, n]) => s.repeat(n)).join('');
    checkSymbols(text);
    if (text.length > HUFFMAN_LIMITS.maxRunsText) throw new InputError(`The counts add up to ${text.length} characters; keep the total at ${HUFFMAN_LIMITS.maxRunsText} or less.`);
    return { text, runs };
  }
  const quoted = trimmed.match(/^"(.*)"$/s);
  const text = quoted ? quoted[1] : trimmed;
  if (!quoted && text.length === 0) throw new InputError('Type a text such as abracadabra (or "" for the empty text).');
  if (/[\r\n\t]/.test(text)) throw new InputError('Keep the text on one line, without tabs.');
  checkSymbols(text);
  if (text.length > HUFFMAN_LIMITS.maxText) {
    throw new InputError(`At most ${HUFFMAN_LIMITS.maxText} characters, so every step stays readable (got ${text.length}). For a longer text, give counts: "freq a:45, b:13".`);
  }
  return { text };
}

/** How a symbol is drawn in the picture: a space becomes an open box. */
export function showSymbol(c: string): string {
  return c === ' ' ? SYM.openBox : c;
}

/** Python's repr of a one-character string: 'a', ' ', "'", '\\'. */
export function reprChar(c: string): string {
  if (c === "'") return `"'"`;
  if (c === '\\') return "'\\\\'";
  return `'${c}'`;
}

/* ---------- pseudocode ---------- */

export const HUFFMAN_CODE = [
  'build_huffman_tree(text):',
  '  if not text: return None',
  '  freq = Counter(text)                    # symbols in order of first appearance',
  '  for char, count in freq.items(): heapq.heappush(heap, HuffmanNode(char, count))',
  '  while len(heap) > 1:',
  '    left = heapq.heappop(heap)             # the lightest tree; __lt__ compares freq only',
  '    right = heapq.heappop(heap)',
  '    merged = HuffmanNode(freq=left.freq + right.freq, left=left, right=right)',
  '    heapq.heappush(heap, merged)',
  '  return heap[0]',
  'build_codes(root, code=""):',
  '  if root.char is not None: codes[root.char] = code if code else "0"; return',
  '  build_codes(root.left, code + "0"); build_codes(root.right, code + "1")',
  'huffman_encode(text): encoded = "".join(codes[char] for char in text)',
  'calculate_compression_ratio: ratio = len(encoded) / (len(text) * 8); savings = (1 - ratio) * 100',
  '# heappush: append, then move up while strictly smaller than the parent at (i - 1) // 2',
  '# heappop: take heap[0], move the last entry to [0], move the smaller child up to a leaf, then back up',
];

const L = {
  empty: 1,
  count: 2,
  push: 3,
  loop: 4,
  popLeft: 5,
  popRight: 6,
  merge: 7,
  pushMerged: 8,
  done: 9,
  codesStart: 10,
  leaf: 11,
  recurse: 12,
  encode: 13,
  ratio: 14,
  siftPush: 15,
  siftPop: 16,
};

/* ---------- tracer ---------- */

export interface HuffNode {
  /** The order in which the node was first pushed: leaves in Counter order, then each merged node. */
  id: number;
  freq: number;
  char: string | null;
  left: HuffNode | null;
  right: HuffNode | null;
}

/** One heapq call, as the fixture records it: the node pushed or popped and the heap after it. */
export type HeapEvent = ['push' | 'pop', number, number[]];

export interface HuffmanRun {
  frames: Array<Frame<HuffmanState>>;
  log: HeapEvent[];
  root: HuffNode | null;
  /** build_codes' dict, in insertion order. */
  codes: Array<[string, string]>;
  encoded: string;
  ratio: number;
  savings: number;
}

interface SnapOpts {
  nodes?: Record<number, Role>;
  edges?: Record<number, Role>;
  heap?: Record<number, Role>;
  text?: Record<number, Role>;
  codes?: Record<number, Role>;
  bits?: Record<number, Role>;
  calls?: string[];
  vars?: Array<[string, string | number]>;
}

export function huffmanTrace(input: HuffmanInput): HuffmanRun {
  const { text, runs } = input;
  const frames: Array<Frame<HuffmanState>> = [];
  const log: HeapEvent[] = [];
  const heap: HuffNode[] = [];
  let loose: Array<{ node: HuffNode; tag: string }> = [];
  const codes: Array<[string, string]> = [];
  const codeOf = new Map<string, string>();
  const bits: string[] = [];
  let merges = 0;

  // The text as units: one per character, or one per run in the frequency form.
  const units: Array<{ s: string; n: number }> = runs ? runs.map(([s, n]) => ({ s, n })) : Array.from(text, (s) => ({ s, n: 1 }));
  const unitsOf = (c: string, role: Role) => {
    const out: Record<number, Role> = {};
    units.forEach((u, i) => {
      if (u.s === c) out[i] = role;
    });
    return out;
  };
  const desc = (n: HuffNode) => (n.char !== null ? `${reprChar(n.char)} (freq ${n.freq})` : `the merged tree of freq ${n.freq}`);
  const short = (n: HuffNode) => (n.char !== null ? `${reprChar(n.char)} ${n.freq}` : `[${n.freq}]`);

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const views: HuffNodeView[] = [];
    const add = (n: HuffNode | null) => {
      if (!n) return;
      views.push({
        id: n.id,
        symbol: n.char === null ? null : showSymbol(n.char),
        freq: n.freq,
        left: n.left?.id ?? null,
        right: n.right?.id ?? null,
        role: o.nodes?.[n.id] ?? 'idle',
        edgeRole: o.edges?.[n.id],
        code: n.char !== null ? codeOf.get(n.char) : undefined,
      });
      add(n.left);
      add(n.right);
    };
    heap.forEach(add);
    loose.forEach((l) => add(l.node));
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['heap size', heap.length], ['merges', merges]],
      state: {
        nodes: views,
        heap: heap.map((n) => n.id),
        heapRoles: o.heap,
        loose: loose.map((l) => ({ id: l.node.id, tag: l.tag })),
        text: units.map((u, i) => ({ s: showSymbol(u.s), n: u.n, role: o.text?.[i] })),
        codes: codes.map(([c, w], i) => ({ symbol: showSymbol(c), code: w, role: o.codes?.[i] })),
        bits: bits.map((b, i) => ({ bits: b, role: o.bits?.[i] })),
        calls: o.calls,
      },
    });
  };
  const record = (kind: 'push' | 'pop', n: HuffNode) => log.push([kind, n.id, heap.map((h) => h.id)]);

  /** heapq.heappush: append, then _siftdown(heap, 0, len(heap) - 1). */
  const heapPush = (node: HuffNode, line: number, why: string, extra: SnapOpts = {}) => {
    loose = loose.filter((l) => l.node !== node);
    heap.push(node);
    let pos = heap.length - 1;
    snap(
      line,
      `${why}heappush appends ${desc(node)} at index ${pos}` +
        (pos === 0 ? '. The heap was empty, so it is the root.' : `, then compares it with its parent at index (${pos} - 1) // 2 = ${(pos - 1) >> 1} to sift it up.`),
      { ...extra, heap: { [pos]: 'active' }, nodes: { [node.id]: 'active' } },
    );
    while (pos > 0) {
      const pp = (pos - 1) >> 1;
      const parent = heap[pp];
      if (node.freq < parent.freq) {
        heap[pos] = parent;
        heap[pp] = node;
        snap(
          L.siftPush,
          `${node.freq} < ${parent.freq}: the new entry is lighter than its parent ${short(parent)}, so heapq moves the parent down to index ${pos} and the new entry up to index ${pp}` +
            (pp === 0 ? ', the root.' : '.'),
          { ...extra, heap: { [pp]: 'active', [pos]: 'compare' }, nodes: { [node.id]: 'active' } },
        );
        pos = pp;
      } else {
        snap(
          L.siftPush,
          node.freq === parent.freq
            ? `${node.freq} is not < ${parent.freq}: a tie. heapq moves an entry up only when it is strictly smaller (HuffmanNode.__lt__), so it stays at index ${pos}, after the older ${short(parent)}.`
            : `${node.freq} is not < ${parent.freq}: the parent ${short(parent)} is lighter, so the new entry stays at index ${pos}.`,
          { ...extra, heap: { [pos]: 'active', [pp]: 'compare' }, nodes: { [node.id]: 'active' } },
        );
        break;
      }
    }
    record('push', node);
  };

  /** heapq.heappop: pop the last entry, put it at the root, _siftup to a leaf, then _siftdown back up. */
  const heapPop = (tag: 'left' | 'right'): HuffNode => {
    const line = tag === 'left' ? L.popLeft : L.popRight;
    const last = heap.pop()!;
    if (heap.length === 0) {
      loose.push({ node: last, tag });
      snap(line, `${tag} = heappop(heap): only ${desc(last)} is left, so heap.pop() removes it and heappop returns it as ${tag}.`, { nodes: { [last.id]: 'done' } });
      record('pop', last);
      return last;
    }
    const result = heap[0];
    heap[0] = last;
    loose.push({ node: result, tag });
    snap(
      line,
      `${tag} = heappop(heap): heap[0] is ${desc(result)}, a lightest tree, so it leaves the heap as ${tag}. ` +
        (heap.length === 1
          ? `The last entry ${short(last)} moves to index 0, the only place left.`
          : `The last entry ${short(last)} moves from index ${heap.length} to the root, and heapq now sifts it down.`),
      { heap: { 0: 'active' }, nodes: { [result.id]: 'done', [last.id]: 'active' } },
    );
    // _siftup: move the smaller child up until the moving entry reaches a leaf (no comparison with it).
    let pos = 0;
    const end = heap.length;
    let child = 1;
    while (child < end) {
      const right = child + 1;
      let pick = child;
      let why: string;
      if (right < end) {
        const a = heap[child];
        const b = heap[right];
        if (!(a.freq < b.freq)) {
          pick = right;
          why =
            a.freq === b.freq
              ? `The children at ${child} and ${right} tie at ${a.freq}: heapq takes the left child only when it is strictly smaller, so the right one, ${short(b)}, moves up`
              : `The children are ${short(a)} at ${child} and ${short(b)} at ${right}: the right one is smaller and moves up`;
        } else {
          why = `The children are ${short(a)} at ${child} and ${short(b)} at ${right}: the left one is smaller and moves up`;
        }
      } else {
        why = `Index ${pos} has only a left child, ${short(heap[child])}, and it moves up`;
      }
      const moved = heap[pick];
      heap[pick] = heap[pos];
      heap[pos] = moved;
      const other = right < end ? (pick === child ? right : child) : undefined;
      snap(
        L.siftPop,
        `${why} to index ${pos}, and ${short(last)} drops to index ${pick}. heapq does not compare the moving entry on the way down: it goes all the way to a leaf, then climbs back if it must.`,
        { heap: { [pos]: 'compare', [pick]: 'active', ...(other !== undefined ? { [other]: 'compare' } : {}) }, nodes: { [result.id]: 'done', [last.id]: 'active' } },
      );
      pos = pick;
      child = 2 * pos + 1;
    }
    // _siftdown(heap, 0, pos): back up while strictly smaller than the parent.
    while (pos > 0) {
      const pp = (pos - 1) >> 1;
      const parent = heap[pp];
      if (last.freq < parent.freq) {
        heap[pos] = parent;
        heap[pp] = last;
        snap(L.siftPop, `At the leaf, ${last.freq} < ${parent.freq}: ${short(last)} is lighter than its parent, so it climbs back to index ${pp}.`, {
          heap: { [pp]: 'active', [pos]: 'compare' },
          nodes: { [result.id]: 'done', [last.id]: 'active' },
        });
        pos = pp;
      } else {
        snap(
          L.siftPop,
          `${last.freq} is not < ${parent.freq} (its parent ${short(parent)}${last.freq === parent.freq ? ', a tie' : ''}), so ${short(last)} stays at index ${pos}. The heap is in order again.`,
          { heap: { [pos]: 'active', [pp]: 'compare' }, nodes: { [result.id]: 'done', [last.id]: 'active' } },
        );
        break;
      }
    }
    record('pop', result);
    return result;
  };

  /* ---- build_huffman_tree ---- */
  if (text.length === 0) {
    snap(
      L.empty,
      'The text is empty: build_huffman_tree returns None and huffman_encode returns ("", {}, None) without building anything. ' +
        'calculate_compression_ratio then has 0 original bits, so it reports a ratio of 0 and, oddly, savings of 100.',
      { vars: [['encoded bits', 0]] },
    );
    return { frames, log, root: null, codes, encoded: '', ratio: 0, savings: 100 };
  }

  const freq = new Map<string, number>();
  for (const c of text) freq.set(c, (freq.get(c) ?? 0) + 1);
  const order = [...freq.entries()];
  snap(
    L.count,
    `Counter(text) counts the ${text.length} characters: ${order.length} different symbol${order.length === 1 ? '' : 's'}, ` +
      `${order.map(([c, n]) => `${reprChar(c)} ${n}`).join(', ')}. freq.items() lists them in order of first appearance, and that is the order they are pushed.`,
    { text: Object.fromEntries(units.map((_, i) => [i, 'compare' as Role])), vars: [['characters', text.length], ['symbols', order.length]] },
  );

  let nextId = 0;
  for (const [c, n] of order) {
    const leaf: HuffNode = { id: nextId++, freq: n, char: c, left: null, right: null };
    heapPush(leaf, L.push, `Leaf ${reprChar(c)} occurs ${n} time${n === 1 ? '' : 's'}. `, { text: unitsOf(c, 'active') });
  }

  const ids = (n: HuffNode | null): number[] => (n ? [n.id, ...ids(n.left), ...ids(n.right)] : []);
  while (heap.length > 1) {
    snap(
      L.loop,
      `len(heap) = ${heap.length} > 1: take the two lightest trees out and join them. Joining the lightest pair first is the greedy choice: their symbols end up deepest, with the longest codes.`,
      { heap: Object.fromEntries(heap.map((_, i) => [i, 'compare' as Role])) },
    );
    const left = heapPop('left');
    const right = heapPop('right');
    const merged: HuffNode = { id: nextId++, freq: left.freq + right.freq, char: null, left, right };
    loose = [{ node: merged, tag: 'merged' }];
    merges += 1;
    const sub = Object.fromEntries([...ids(left), ...ids(right)].map((id) => [id, 'done' as Role]));
    snap(
      L.merge,
      `merged = HuffmanNode(freq = ${left.freq} + ${right.freq} = ${merged.freq}): the first pop (${short(left)}) becomes the left child, on edge 0, and the second (${short(right)}) the right child, on edge 1. ` +
        `Every symbol below gains one bit.`,
      { nodes: { ...sub, [merged.id]: 'active' }, edges: { [left.id]: 'active', [right.id]: 'active' } },
    );
    heapPush(merged, L.pushMerged, 'The merged tree goes back: ');
  }

  const root = heap[0];
  snap(
    L.done,
    `len(heap) is 1 after ${merges} merge${merges === 1 ? '' : 's'} (one fewer than the ${order.length} symbols): heap[0] is the Huffman tree. Its root's freq, ${root.freq}, is the length of the text.`,
    { nodes: { [root.id]: 'done' }, heap: { 0: 'done' } },
  );

  /* ---- build_codes ---- */
  snap(L.codesStart, 'build_codes(root) walks the tree from the root, left subtree first: going left appends "0" to the code, going right appends "1". A symbol\'s code is its path.', {
    nodes: { [root.id]: 'active' },
    calls: ["''"],
  });
  const leafRoles: Record<number, Role> = {};
  const pathOf = new Map<string, number[]>();
  const walk = (node: HuffNode, code: string, path: number[], calls: string[]) => {
    if (node.char !== null) {
      const word = code || '0';
      codes.push([node.char, word]);
      codeOf.set(node.char, word);
      pathOf.set(node.char, path);
      const edges = Object.fromEntries(path.map((id) => [id, 'active' as Role]));
      snap(
        L.leaf,
        code
          ? `Leaf ${reprChar(node.char)} is reached by the path ${code.split('').join(' ')}, so codes[${reprChar(node.char)}] = "${code}": ${code.length} bit${code.length === 1 ? '' : 's'} for a symbol that occurs ${node.freq} time${node.freq === 1 ? '' : 's'}.`
          : `The root is a leaf, so the path to it is empty. build_codes stores "0" instead, so ${reprChar(node.char)} still takes one bit per character.`,
        {
          nodes: { ...leafRoles, ...Object.fromEntries(path.map((id) => [id, 'compare' as Role])), [node.id]: 'active' },
          edges,
          codes: { [codes.length - 1]: 'active' },
          text: unitsOf(node.char, 'active'),
          calls,
          vars: [['code', `"${word}"`]],
        },
      );
      leafRoles[node.id] = 'done';
      return;
    }
    walk(node.left!, code + '0', [...path, node.left!.id], [...calls, `'${code}0'`]);
    walk(node.right!, code + '1', [...path, node.right!.id], [...calls, `'${code}1'`]);
  };
  walk(root, '', [root.id], ["''"]);

  /* ---- huffman_encode ---- */
  let produced = 0;
  units.forEach((u, i) => {
    const word = codeOf.get(u.s)!;
    const chunk = word.repeat(u.n);
    bits.push(chunk);
    produced += chunk.length;
    const leaf = [...freq.keys()].indexOf(u.s);
    const path = pathOf.get(u.s)!;
    snap(
      L.encode,
      u.n === 1
        ? `Encode ${reprChar(u.s)} (character ${i + 1} of ${units.length}): append its code "${word}". ${produced} bit${produced === 1 ? '' : 's'} so far, against ${8 * (i + 1)} at 8 bits per character.`
        : `Encode the run of ${u.n} x ${reprChar(u.s)}: append "${word}" ${u.n} times, ${chunk.length} bits. ${produced} bits so far.`,
      {
        nodes: { ...leafRoles, [leaf]: 'active' },
        edges: Object.fromEntries(path.slice(1).map((id) => [id, 'active' as Role])),
        text: { ...Object.fromEntries(units.slice(0, i).map((_, j) => [j, 'done' as Role])), [i]: 'active' },
        codes: { [codes.findIndex(([c]) => c === u.s)]: 'active' },
        bits: { [i]: 'active' },
        vars: [['encoded bits', produced]],
      },
    );
  });

  /* ---- calculate_compression_ratio ---- */
  const encoded = bits.join('');
  const originalBits = text.length * 8;
  const ratio = encoded.length / originalBits;
  const savings = (1 - ratio) * 100;
  const fixed = order.length <= 1 ? 1 : Math.ceil(Math.log2(order.length));
  snap(
    L.ratio,
    `Encoded: ${encoded.length} bits against ${text.length} x 8 = ${originalBits}, so ratio = ${encoded.length} / ${originalBits} = ${ratio.toFixed(4)} and savings = ${savings.toFixed(2)}%. ` +
      `A fixed ${fixed}-bit code for ${order.length} symbol${order.length === 1 ? '' : 's'} would need ${fixed * text.length} bits; the tree itself is not counted.`,
    {
      nodes: { ...leafRoles },
      text: Object.fromEntries(units.map((_, i) => [i, 'done' as Role])),
      vars: [
        ['encoded bits', encoded.length],
        ['original bits', originalBits],
        ['ratio', ratio.toFixed(4)],
        ['savings', `${savings.toFixed(2)}%`],
      ],
    },
  );
  return { frames, log, root, codes, encoded, ratio, savings };
}
