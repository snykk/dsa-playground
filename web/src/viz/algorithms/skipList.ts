/**
 * Skip list tracer: search, insert (with its coin flips) and delete on a set of integer keys.
 *
 * Mirrors Data_Structures/Linear/Linked_List/Skip_List/Python/skip_list.py (SkipList):
 *   every operation starts at the header on level `level` and walks down to level 0, moving
 *   right while forward[i].key < key; insert and delete save update[i], the last node visited
 *   on level i. insert returns if the key is present; otherwise it draws new_level with
 *   _random_level() (lvl += 1 while random() < p and lvl < max_level: each round draws before
 *   the cap is checked), raises `level`, and splices the tower in from level 0 up. delete
 *   unlinks from level 0 up, stops at the first level the node does not reach, then lowers
 *   `level` while the top level is empty.
 * Python draws from random.random(). Here the draws come from mulberry32(seed), so a run can be
 * replayed, and "insert 6 level 2" replaces the draw with a fixed level. The golden fixture
 * (web/scripts/gen_lists_fixtures.py) feeds the same generator into the Python object, so both
 * build the same towers, and pins the levels, the draws and every key compared (the search path).
 *
 * Input: "seed 7; insert 3 6 9, search 6, delete 3"  (also "p 0.25", "max 3", "insert 6 level 2" or "insert 6^2")
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { ChainLaneView, ChainLinkView, ChainNodeView, ChainPointerView, ChainState } from '../renderers/ChainView';
import type { StripData, StripItem } from '../ui/molecules/Strip';

export type SkipOp = { kind: 'insert'; key: number; level?: number } | { kind: 'search'; key: number } | { kind: 'delete'; key: number };

export interface SkipInput {
  seed: number;
  p: number;
  maxLevel: number;
  ops: SkipOp[];
}

export interface SkipStep {
  op: SkipOp;
  /** search / delete: True or False; insert: None. */
  result: boolean | null;
  level: number;
  /** Keys on each level, level 0 first, up to `level`. */
  levels: number[][];
  /** Node keys compared with the key by `<`, in order: the search path. */
  lt: number[];
  /** The node key checked for equality at the end (null when current was None). */
  eq: number | null;
  /** Numbers drawn from the generator by this operation. */
  draws: number;
  /** insert: the new tower's top level; null when nothing was inserted. */
  height: number | null;
}

export interface SkipRun {
  frames: Array<Frame<ChainState>>;
  steps: SkipStep[];
}

export const SKIP_LIMITS = { maxOps: 24, maxKeys: 10, maxLevel: 16 };

/** mulberry32: a small seeded generator of floats in [0, 1); gen_lists_fixtures.py has the same one. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAMES: Record<string, SkipOp['kind']> = {
  insert: 'insert',
  ins: 'insert',
  i: 'insert',
  add: 'insert',
  search: 'search',
  s: 'search',
  find: 'search',
  contains: 'search',
  delete: 'delete',
  del: 'delete',
  d: 'delete',
  remove: 'delete',
};

/** Parse "seed 7; p 0.5; max 4; insert 3 6^2, insert 9 level 1, search 6, delete 3". */
export function parseSkipList(text: string, { maxOps = SKIP_LIMITS.maxOps, maxKeys = SKIP_LIMITS.maxKeys } = {}): SkipInput {
  let seed: number | undefined;
  let p: number | undefined;
  let maxLevel: number | undefined;
  const ops: SkipOp[] = [];
  const once = (value: unknown, what: string) => {
    if (value !== undefined) throw new InputError(`Give ${what} only once.`);
  };
  const readKey = (token: string, raw: string): number => {
    if (!/^-?\d{1,3}$/.test(token) || Number(token) < -99) throw new InputError(`"${token}" in "${raw}" is not a key: use whole numbers from -99 to 999.`);
    return Number(token);
  };
  for (const raw of text.split(/[;,\n]+/).map((t) => t.trim()).filter(Boolean)) {
    const lower = raw.toLowerCase();
    let m = lower.match(/^seed\s*[:=]?\s*(\d{1,10})$/);
    if (m) {
      once(seed, 'the seed ("seed 7")');
      seed = Number(m[1]);
      if (seed > 4294967295) throw new InputError('The seed must be below 4294967296.');
      continue;
    }
    m = lower.match(/^p\s*[:=]?\s*(\d*\.?\d*)$/);
    if (m) {
      once(p, 'p ("p 0.5")');
      if (!/^0?\.\d{1,3}$/.test(m[1]) || Number(m[1]) <= 0) throw new InputError(`p must be a probability between 0 and 1 with at most 3 decimals, such as 0.5 or 0.25 (got "${m[1]}").`);
      p = Number(m[1]);
      continue;
    }
    m = lower.match(/^max(?:_?level)?\s*[:=]?\s*(\d+)$/);
    if (m) {
      once(maxLevel, 'max_level ("max 4")');
      maxLevel = Number(m[1]);
      if (maxLevel > SKIP_LIMITS.maxLevel) throw new InputError(`max_level goes up to ${SKIP_LIMITS.maxLevel}, the Python default (got ${maxLevel}).`);
      continue;
    }
    const words = raw.replace(/[()]/g, ' ').trim().split(/\s+/);
    const kind = NAMES[words[0].toLowerCase()];
    if (!kind) {
      throw new InputError(`Cannot read "${raw}". Write operations like "insert 6", "search 6" or "delete 6", and settings like "seed 7", separated by commas.`);
    }
    const args = words.slice(1);
    if (args.length === 0) throw new InputError(`"${raw}" needs a key, e.g. "${words[0]} 6".`);
    if (kind === 'insert' && args.length === 3 && /^(?:level|lvl)$/i.test(args[1])) {
      if (!/^\d{1,2}$/.test(args[2])) throw new InputError(`"${raw}": the level must be a whole number from 0 to 16.`);
      ops.push({ kind, key: readKey(args[0], raw), level: Number(args[2]) });
      continue;
    }
    for (const a of args) {
      const fixed = a.match(/^(-?\d+)\^(\d{1,2})$/);
      if (fixed) {
        if (kind !== 'insert') throw new InputError(`"${raw}": only insert takes a level ("insert 6^2").`);
        ops.push({ kind, key: readKey(fixed[1], raw), level: Number(fixed[2]) });
      } else ops.push(kind === 'insert' ? { kind, key: readKey(a, raw) } : { kind, key: readKey(a, raw) });
    }
  }
  if (ops.length === 0) throw new InputError('Add at least one operation, e.g. "seed 7; insert 3 6 9, search 6".');
  if (ops.length > maxOps) throw new InputError(`At most ${maxOps} operations, please (got ${ops.length}).`);
  const cap = maxLevel ?? SKIP_LIMITS.maxLevel;
  const keys = new Set<number>();
  ops.forEach((op, i) => {
    if (op.kind === 'insert' && op.level !== undefined && op.level > cap) {
      throw new InputError(`insert ${op.key} level ${op.level}: a tower cannot go above max_level = ${cap}.`);
    }
    if (op.kind === 'insert') keys.add(op.key);
    else if (op.kind === 'delete') keys.delete(op.key);
    if (keys.size > maxKeys) throw new InputError(`At most ${maxKeys} keys at once, so the picture stays readable (operation ${i + 1} would make ${keys.size}).`);
  });
  return { seed: seed ?? 1, p: p ?? 0.5, maxLevel: cap, ops };
}

export function formatSkipOp(op: SkipOp): string {
  return op.kind === 'insert' && op.level !== undefined ? `insert(${op.key}) level ${op.level}` : `${op.kind}(${op.key})`;
}

interface SNode {
  id: number;
  key: number;
  forward: Array<SNode | null>;
}

interface SnapOpts {
  /** Roles of single boxes: [node, level, role]. */
  boxes?: Array<[SNode | null, number, Role]>;
  /** Roles of whole towers. */
  towers?: Array<[SNode, Role]>;
  /** Links to color: the link leaving [node, level]. */
  links?: Array<[SNode, number, Role]>;
  /** Where `current` points: a box, or null for None; undefined hides it. */
  cursor?: [SNode, number] | null;
  update?: Array<SNode | undefined>;
  lane?: number;
  vars?: Array<[string, string | number]>;
}

/** How far a tower being linked in (or a deleted one leaving) sits below its rows. */
const LIFT = 0.4;

/** Truncated to 3 decimals, so the shown number is below p exactly when the draw is (p has at most 3 decimals). */
const fmt = (r: number) => (Math.floor(r * 1000) / 1000).toFixed(3);

/** Trace a script on a SkipList(max_level, p) whose random() is mulberry32(seed). */
export function traceSkipList({ seed, p, maxLevel, ops }: SkipInput): SkipRun {
  const rand = mulberry32(seed);
  const header: SNode = { id: 0, key: -1, forward: new Array<SNode | null>(maxLevel + 1).fill(null) };
  let level = 0;
  let nextId = 1;
  /** Nodes left to right, as drawn (the header is column 0). */
  let order: SNode[] = [];
  /** A tower whose height is being drawn (no Node object yet). */
  let building: { node: SNode; height: number } | null = null;
  let ghost: { node: SNode; col: number } | null = null;
  /** The tower being inserted: drawn a little below its rows until it is linked in. */
  let lifted: SNode | null = null;
  let current = -1;
  let flips: StripItem[] = [];
  const frames: Array<Frame<ChainState>> = [];
  const steps: SkipStep[] = [];

  const boxId = (n: SNode, l: number) => (n === header ? `H:${l}` : `${n.id}:${l}`);
  const name = (n: SNode | null | undefined) => (n === header ? 'header' : n ? String(n.key) : 'None');
  const heightOf = (n: SNode) => (building?.node === n ? building.height : n.forward.length - 1);
  const levelKeys = (): number[][] =>
    Array.from({ length: level + 1 }, (_, i) => {
      const row: number[] = [];
      for (let x = header.forward[i]; x; x = x.forward[i]) row.push(x.key);
      return row;
    });

  const strips = (): StripData[] => {
    const s: StripData[] = [
      { label: 'Operations', items: ops.map((op, i) => ({ text: formatSkipOp(op), role: i === current ? 'active' : i < current ? 'muted' : undefined })) },
    ];
    if (flips.length) s.push({ label: 'Coin flips', items: [...flips] });
    return s;
  };

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const boxRoles = new Map<string, Role>();
    for (const [n, r] of o.towers ?? []) for (let l = 0; l <= heightOf(n); l++) boxRoles.set(boxId(n, l), r);
    for (const [n, l, r] of o.boxes ?? []) if (n) boxRoles.set(boxId(n, l), r);
    const linkRoles = new Map<string, Role>();
    for (const [n, l, r] of o.links ?? []) linkRoles.set(boxId(n, l), r);

    const nodes: ChainNodeView[] = [];
    const links: ChainLinkView[] = [];
    const top = Math.max(level, building ? building.height : 0);
    for (let l = 0; l <= level; l++) {
      nodes.push({ id: boxId(header, l), label: 'H', col: 0, row: -l, sentinel: true });
      const to = header.forward[l];
      links.push({ from: boxId(header, l), to: to ? boxId(to, l) : null, role: linkRoles.get(boxId(header, l)) });
    }
    order.forEach((n, i) => {
      for (let l = 0; l <= heightOf(n); l++) {
        nodes.push({ id: boxId(n, l), label: n.key, col: i + 1, row: -l + (n === lifted ? LIFT : 0), role: boxRoles.get(boxId(n, l)) ?? 'idle' });
        if (l < n.forward.length) {
          const to = n.forward[l];
          links.push({ from: boxId(n, l), to: to ? boxId(to, l) : null, role: linkRoles.get(boxId(n, l)) });
        }
      }
    });
    if (ghost) {
      const g = ghost.node;
      for (let l = 0; l < g.forward.length; l++) {
        nodes.push({ id: boxId(g, l), label: g.key, col: ghost.col, row: -l + LIFT, ghost: true, role: 'muted' });
        const to = g.forward[l];
        links.push({ from: boxId(g, l), to: to ? boxId(to, l) : null });
      }
    }
    const pointers: ChainPointerView[] = [];
    if (o.cursor !== undefined) pointers.push({ name: 'current', target: o.cursor ? boxId(o.cursor[0], o.cursor[1]) : null, role: 'active' });
    (o.update ?? []).forEach((u, i) => {
      if (u) pointers.push({ name: `update[${i}]`, target: boxId(u, i) });
    });
    const lanes: ChainLaneView[] = Array.from({ length: top + 1 }, (_, l) => ({ row: -l, label: `level ${l}`, role: o.lane === l ? 'active' : undefined }));
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['level', level], ['keys', order.length], ['seed', seed], ['p', p], ['max_level', maxLevel]],
      state: {
        nodes,
        links,
        pointers,
        lanes,
        note: 'H is the header. Each row is a level; a tower is one node with a forward link on each of its levels.',
        strips: strips(),
      },
    });
  };

  /**
   * The walk shared by search, insert and delete: from the header on the top level, move right
   * while the next key is smaller, else drop a level. Insert and delete save update[i].
   */
  const descend = (key: number, saving: 'insert' | 'delete' | null, lines: { start: number; move: number; stop: number }, vars: Array<[string, string | number]>) => {
    let cur: SNode = header;
    const update: SNode[] = [];
    const path: Array<[SNode, number, Role]> = [[header, level, 'done']];
    const followed: Array<[SNode, number, Role]> = [];
    const lt: number[] = [];
    let moves = 0;
    let drops = 0;
    const upd = () => (saving ? [['update', `[${Array.from({ length: level + 1 }, (_, i) => name(update[i])).join(', ')}]`] as [string, string]] : []);
    snap(lines.start, `${saving ? `${saving}(${key})` : `search(${key})`}: start at the header on the top level, level ${level}.`, {
      cursor: [header, level],
      lane: level,
      vars: [...vars, ['moves right', 0], ['drops', 0], ...upd()],
    });
    for (let i = level; i >= 0; i--) {
      for (;;) {
        const nx = cur.forward[i];
        if (nx && nx.key < key) {
          lt.push(nx.key);
          followed.push([cur, i, 'done']);
          cur = nx;
          moves++;
          path.push([cur, i, 'done']);
          snap(lines.move, `Level ${i}: the next key ${nx.key} is smaller than ${key}, so move right to ${nx.key}.`, {
            boxes: [...path, [cur, i, 'active']],
            links: followed,
            cursor: [cur, i],
            update: saving ? update : undefined,
            lane: i,
            vars: [...vars, ['moves right', moves], ['drops', drops], ...upd()],
          });
          continue;
        }
        if (nx) lt.push(nx.key);
        if (saving) update[i] = cur;
        const why = nx ? `the next key ${nx.key} is not smaller than ${key}` : `${name(cur)}.forward[${i}] is None (the end of level ${i})`;
        const saved =
          saving === 'insert'
            ? ` update[${i}] = ${name(cur)}: on level ${i} the new tower goes right after it.`
            : saving === 'delete'
              ? ` update[${i}] = ${name(cur)}: if ${key} is on level ${i}, it comes right after this node.`
              : '';
        if (i > 0) {
          drops++;
          path.push([cur, i - 1, 'done']);
        }
        snap(lines.stop, `Level ${i}: ${why}, so ${i > 0 ? `drop to level ${i - 1}` : 'stop: level 0 is the last one'}.${saved}`, {
          boxes: [...path, [cur, Math.max(0, i - 1), 'active'], ...(nx ? ([[nx, i, 'compare']] as Array<[SNode, number, Role]>) : [])],
          links: [...followed, ...(nx ? ([[cur, i, 'compare']] as Array<[SNode, number, Role]>) : [])],
          cursor: [cur, Math.max(0, i - 1)],
          update: saving ? update : undefined,
          lane: Math.max(0, i - 1),
          vars: [...vars, ['moves right', moves], ['drops', drops], ...upd()],
        });
        break;
      }
    }
    return { cur, update, lt, moves, drops, path, followed };
  };

  const doSearch = (key: number, vars: Array<[string, string | number]>): Omit<SkipStep, 'op' | 'level' | 'levels'> => {
    const { cur, lt, moves, drops, path, followed } = descend(key, null, { start: 1, move: 4, stop: 3 }, vars);
    const cand = cur.forward[0];
    const counts: Array<[string, string | number]> = [...vars, ['moves right', moves], ['drops', drops]];
    snap(5, `current = current.forward[0] = ${name(cand)}: the only node that can hold ${key}.`, {
      boxes: [...path, ...(cand ? ([[cand, 0, 'compare']] as Array<[SNode, number, Role]>) : [])],
      links: [...followed, [cur, 0, 'compare']],
      cursor: cand ? [cand, 0] : null,
      lane: 0,
      vars: counts,
    });
    const found = cand !== null && cand.key === key;
    const plain = order.filter((n) => n.key < key).length;
    snap(
      6,
      found
        ? `${cand.key} == ${key}: found, return True. The walk made ${moves} move${moves === 1 ? '' : 's'} right and ${drops} drop${drops === 1 ? '' : 's'}; walking level 0 alone would pass ${plain} node${plain === 1 ? '' : 's'} first.`
        : `${cand ? `${cand.key} != ${key}` : 'current is None'}: ${key} is not in the list, return False.`,
      { boxes: [...path, ...(cand ? ([[cand, 0, found ? 'good' : 'bad']] as Array<[SNode, number, Role]>) : [])], links: followed, cursor: cand ? [cand, 0] : null, lane: 0, vars: counts },
    );
    return { result: found, lt, eq: cand ? cand.key : null, draws: 0, height: null };
  };

  const doInsert = (key: number, fixed: number | undefined, vars: Array<[string, string | number]>): Omit<SkipStep, 'op' | 'level' | 'levels'> => {
    const { cur, update, lt, path, followed } = descend(key, 'insert', { start: 8, move: 8, stop: 8 }, vars);
    const cand = cur.forward[0];
    const showUpdate = () => ['update', `[${update.map((u) => name(u)).join(', ')}]`] as [string, string];
    if (cand && cand.key === key) {
      snap(10, `current = current.forward[0] holds ${key} already: insert returns. The list stores each key once, and no coin is flipped.`, {
        boxes: [...path, [cand, 0, 'bad']],
        links: followed,
        cursor: [cand, 0],
        update,
        vars: [...vars, showUpdate()],
      });
      return { result: null, lt, eq: key, draws: 0, height: null };
    }
    snap(9, `current = current.forward[0] = ${name(cand)}${cand ? `, not ${key}` : ''}: ${key} is new, so it gets a tower right after update[0] = ${name(update[0])}.`, {
      boxes: [...path, ...(cand ? ([[cand, 0, 'compare']] as Array<[SNode, number, Role]>) : [])],
      links: followed,
      cursor: cand ? [cand, 0] : null,
      update,
      vars: [...vars, showUpdate()],
    });
    const node: SNode = { id: nextId++, key, forward: [] };
    const at = update[0] === header ? 0 : order.indexOf(update[0]) + 1;
    const room = at < order.length ? ` The keys after ${name(update[0])} slide right to make room.` : '';
    order.splice(at, 0, node);
    building = { node, height: 0 };
    lifted = node;
    let draws = 0;
    const tower = (): Array<[SNode, Role]> => [[node, 'active']];
    if (fixed !== undefined) {
      building.height = fixed;
      snap(11, `new_level = ${fixed}, fixed by the script in place of _random_level(): no coin is flipped and the generator is not used. The tower spans level${fixed === 0 ? ' 0' : `s 0 to ${fixed}`}.${room}`, {
        towers: tower(),
        update,
        vars: [...vars, ['new_level', fixed], showUpdate()],
      });
    } else {
      snap(11, `new_level = _random_level(): every key is on level 0, and each further level takes a coin flip that lands heads with probability p = ${p}.${room}`, {
        towers: tower(),
        update,
        vars: [...vars, ['lvl', 0], showUpdate()],
      });
      let lvl = 0;
      for (;;) {
        const r = rand();
        draws++;
        if (r < p && lvl < maxLevel) {
          lvl++;
          building.height = lvl;
          flips.push({ text: `${fmt(r)} H`, role: 'done' });
          snap(11, `Flip ${draws}: random() = ${fmt(r)} < p = ${p} and lvl ${lvl - 1} < max_level ${maxLevel}: heads, so lvl = ${lvl} and the tower grows.`, {
            towers: tower(),
            update,
            vars: [...vars, ['lvl', lvl], ['flips', draws], showUpdate()],
          });
          continue;
        }
        flips.push({ text: `${fmt(r)} ${r < p ? 'H' : 'T'}`, role: r < p ? 'done' : undefined });
        snap(
          11,
          r < p
            ? `Flip ${draws}: random() = ${fmt(r)} < p, but lvl = max_level = ${maxLevel}: the cap ends the climb. new_level = ${lvl}.`
            : `Flip ${draws}: random() = ${fmt(r)} is not below p = ${p}: tails, so stop. new_level = ${lvl}.`,
          { towers: tower(), update, vars: [...vars, ['new_level', lvl], ['flips', draws], showUpdate()] },
        );
        break;
      }
    }
    const newLevel = building.height;
    if (newLevel > level) {
      const old = level;
      for (let i = level + 1; i <= newLevel; i++) update[i] = header;
      level = newLevel;
      snap(
        12,
        `new_level ${newLevel} > level ${old}: the list gains ${newLevel - old === 1 ? 'a level' : `${newLevel - old} levels`}. The header starts ${newLevel - old === 1 ? 'it' : 'them'} (update[${old + 1}${newLevel - old > 1 ? `..${newLevel}` : ''}] = header), and level = ${newLevel}.`,
        { towers: tower(), update, lane: newLevel, vars: [...vars, ['new_level', newLevel], showUpdate()] },
      );
    }
    node.forward = new Array<SNode | null>(newLevel + 1).fill(null);
    building = null;
    snap(13, `new_node = Node(${key}, ${newLevel}): ${newLevel + 1} forward link${newLevel === 0 ? '' : 's'}, all None so far.`, {
      towers: tower(),
      update,
      vars: [...vars, ['new_level', newLevel], showUpdate()],
    });
    for (let i = 0; i <= newLevel; i++) {
      const u = update[i];
      node.forward[i] = u.forward[i];
      snap(15, `Level ${i}: new_node.forward[${i}] = update[${i}].forward[${i}] = ${name(node.forward[i])}.`, {
        towers: tower(),
        links: [[node, i, 'active']],
        update,
        lane: i,
        vars: [...vars, ['i', i], showUpdate()],
      });
      u.forward[i] = node;
      snap(16, `Level ${i}: update[${i}].forward[${i}] = new_node: ${name(u)} now points at ${key}${i === newLevel ? (newLevel === 0 ? ', so the new node is linked' : `, and the tower is linked on all ${newLevel + 1} levels`) : ''}.`, {
        towers: tower(),
        links: [[u, i, 'active']],
        update,
        lane: i,
        vars: [...vars, ['i', i], showUpdate()],
      });
    }
    lifted = null;
    snap(16, `${key} settles in place on level${newLevel === 0 ? ' 0' : `s 0 to ${newLevel}`}. Only the links next to the tower changed: no rotations, no rebalancing.`, {
      towers: [[node, 'done']],
      vars: [...vars, ['new_level', newLevel]],
    });
    return { result: null, lt, eq: cand ? cand.key : null, draws, height: newLevel };
  };

  const doDelete = (key: number, vars: Array<[string, string | number]>): Omit<SkipStep, 'op' | 'level' | 'levels'> => {
    const { cur, update, lt, path, followed } = descend(key, 'delete', { start: 18, move: 18, stop: 18 }, vars);
    const cand = cur.forward[0];
    const showUpdate = () => ['update', `[${update.map((u) => name(u)).join(', ')}]`] as [string, string];
    if (!cand || cand.key !== key) {
      snap(20, `current = current.forward[0] = ${name(cand)}${cand ? `, and ${cand.key} != ${key}` : ''}: no node holds ${key}, so delete returns False.`, {
        boxes: [...path, ...(cand ? ([[cand, 0, 'bad']] as Array<[SNode, number, Role]>) : [])],
        links: followed,
        cursor: cand ? [cand, 0] : null,
        update,
        vars: [...vars, showUpdate()],
      });
      return { result: false, lt, eq: cand ? cand.key : null, draws: 0, height: null };
    }
    const h = cand.forward.length - 1;
    snap(19, `current = current.forward[0] = ${key}: found. Its tower spans level${h === 0 ? ' 0' : `s 0 to ${h}`}; unlink it level by level from the bottom.`, {
      boxes: path,
      towers: [[cand, 'active']],
      links: followed,
      cursor: [cand, 0],
      update,
      vars: [...vars, showUpdate()],
    });
    for (let i = 0; i <= level; i++) {
      const u = update[i];
      if (u.forward[i] !== cand) {
        snap(22, `Level ${i}: update[${i}].forward[${i}] is ${name(u.forward[i])}, not ${key}: the tower ends below level ${i}, so stop.`, {
          towers: [[cand, 'active']],
          links: [[u, i, 'compare']],
          update,
          lane: i,
          vars: [...vars, ['i', i], showUpdate()],
        });
        break;
      }
      u.forward[i] = cand.forward[i];
      snap(23, `Level ${i}: update[${i}].forward[${i}] = current.forward[${i}]: ${name(u)} now points ${cand.forward[i] ? `at ${cand.forward[i]!.key}` : 'to None'}, past ${key}.`, {
        towers: [[cand, 'active']],
        links: [[u, i, 'active']],
        update,
        lane: i,
        vars: [...vars, ['i', i], showUpdate()],
      });
    }
    ghost = { node: cand, col: order.indexOf(cand) + 1 };
    order = order.filter((n) => n !== cand);
    snap(23, `${key} is unlinked on every level it reached. Nothing points to it any more, so it leaves (Python's garbage collector frees it; the C++ version calls delete).`, {
      vars,
    });
    ghost = null;
    while (level > 0 && header.forward[level] === null) {
      level--;
      snap(24, `header.forward[${level + 1}] is None: level ${level + 1} is empty, so level drops to ${level}. Searches no longer start on an empty level.`, {
        lane: level,
        vars,
      });
    }
    snap(25, `return True.${level > 0 ? ` (level stays ${level}: header.forward[${level}] is not None.)` : ''}`, { vars });
    return { result: true, lt, eq: key, draws: 0, height: null };
  };

  snap(undefined, `SkipList(max_level=${maxLevel}, p=${p}), with random() drawing from seed ${seed}: an empty list is just the header H, and level = 0.`);

  ops.forEach((op, i) => {
    current = i;
    flips = [];
    const vars: Array<[string, string | number]> = [['op', formatSkipOp(op)]];
    const out = op.kind === 'search' ? doSearch(op.key, vars) : op.kind === 'insert' ? doInsert(op.key, op.level, vars) : doDelete(op.key, vars);
    steps.push({ op, ...out, level, levels: levelKeys() });
  });

  current = ops.length;
  flips = [];
  const rows = levelKeys();
  snap(
    undefined,
    `Done: ${order.length} key${order.length === 1 ? '' : 's'} on ${level + 1} level${level === 0 ? '' : 's'}. Level 0 holds ${rows[0].length ? rows[0].join(' -> ') : 'nothing'}. Each level keeps about p of the keys below it, so a search makes about 1/p moves per level: expected O(log n).`,
  );
  return { frames, steps };
}
