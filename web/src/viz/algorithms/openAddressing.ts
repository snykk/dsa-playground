/**
 * Open addressing tracer: linear and quadratic probing with tombstones.
 *
 * Mirrors Data_Structures/Hashing/Collision_Handling/Python/collision_handling.py,
 * _OpenAddressing._probe / put / get / remove with the two step functions
 *   HashTableOpenAddressing._step(i) = i              (linear)
 *   HashTableQuadraticProbing._step(i) = i*(i+1)//2   (quadratic, triangular numbers)
 * _probe walks index = (start + step(i)) % capacity for i in range(capacity). It stops at an
 * empty slot (the key is absent) or at the key; a tombstone (DELETED) is remembered as the
 * first free slot but never stops the walk, so put cannot store a key twice (the duplicate-key
 * bug fixed in v0.2.0). put raises Exception("Hash table is full") when the walk ends with no
 * free slot; the table never resizes.
 * Golden fixtures (__fixtures__/hashing.json) pin the probe sequence and the slots after every operation.
 *
 * Input: "cap 8; put 1 a, put 17 b, remove 1, put 17 B, get 17" (shared with the chaining tab)
 */
import type { Frame, Role } from '../core/types';
import type { ProbeTableState, SlotView } from '../renderers/OpenAddressingTable';
import type { StripItem } from '../ui/molecules/Strip';
import { formatChainOp, fmtKey, hashText, parseChain, pyHash, quoteKey, reprValue, type HKey, type HVal } from './hashTable';

export type ProbeMode = 'linear' | 'quadratic';

export type OpenOp = { kind: 'put'; key: HKey; value: HVal } | { kind: 'get'; key: HKey } | { kind: 'remove'; key: HKey };

export interface OpenInput {
  mode: ProbeMode;
  capacity: number;
  ops: OpenOp[];
}

/** The collision tabs share one input (the chaining tab parses it the same way). */
export function parseOpen(text: string, mode: ProbeMode): OpenInput {
  const { capacity, ops } = parseChain(text, 'fixed');
  return { mode, capacity, ops: ops as OpenOp[] };
}

export function stepOf(mode: ProbeMode, i: number): number {
  return mode === 'linear' ? i : (i * (i + 1)) / 2;
}

export function openPseudocode(mode: ProbeMode): string[] {
  return [
    '_probe(key):',
    '  start = _hash(key); free = None',
    '  for i in range(capacity):',
    mode === 'linear' ? '    index = (start + i) % capacity' : '    index = (start + i*(i+1)//2) % capacity   # triangular steps',
    '    if buckets[index] is None: return None, (index if free is None else free)',
    '    if buckets[index] is DELETED: if free is None: free = index',
    '    elif buckets[index][0] == key: return index, free',
    '  return None, free                   # every slot probed',
    'put(key, value): found, free = _probe(key)',
    '  if found is not None: buckets[found] = (key, value); return',
    '  if free is None: raise Exception("Hash table is full")',
    '  buckets[free] = (key, value); size += 1',
    'get(key): found, _ = _probe(key)',
    '  return None if found is None else buckets[found][1]',
    'remove(key): found, _ = _probe(key)',
    '  if found is None: return False',
    '  buckets[found] = DELETED; size -= 1; return True',
  ];
}

const L = { hash: 1, empty: 4, tomb: 5, key: 6, exhausted: 7, update: 9, full: 10, insert: 11, get: 13, removeMiss: 15, remove: 16 };

type Slot = null | 'DELETED' | { key: HKey; value: HVal };

export interface OpenStep {
  op: OpenOp;
  /** put: null, or 'full' when it raised; get: the value or null; remove: a boolean. */
  result: HVal | boolean | null | 'full';
  size: number;
  /** null (empty), 'DEL' (tombstone) or [key, value]. */
  slots: Array<null | 'DEL' | [HKey, HVal]>;
  /** Every slot _probe read, in order. */
  probes: number[];
}

export interface OpenRun {
  frames: Array<Frame<ProbeTableState>>;
  steps: OpenStep[];
}

interface SnapOpts {
  roles?: Record<number, Role>;
  probe?: number;
  probeRole?: Role;
  sequence?: StripItem[];
  vars?: Array<[string, string | number]>;
}

export function openTrace({ mode, capacity, ops }: OpenInput): OpenRun {
  const slots: Slot[] = new Array<Slot>(capacity).fill(null);
  let size = 0;
  let current = -1;
  let probed = 0;
  const frames: Array<Frame<ProbeTableState>> = [];
  const steps: OpenStep[] = [];
  const kindName = mode === 'linear' ? 'linear probing' : 'quadratic probing';

  const opStrip = () => ({
    label: 'Operations',
    items: ops.map((op, i): StripItem => ({ text: formatChainOp(op), role: i === current ? 'active' : i < current ? 'muted' : undefined })),
  });

  const view = (o: SnapOpts): SlotView[] =>
    slots.map((s, i): SlotView => {
      const role = o.roles?.[i];
      if (s === null) return { key: '', value: '', role };
      if (s === 'DELETED') return { key: 'DEL', value: '', tomb: true, role: role ?? 'muted' };
      return { key: fmtKey(s.key), value: String(s.value), role };
    });

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const tombs = slots.filter((s) => s === 'DELETED').length;
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['size', size], ['capacity', capacity], ['tombstones', tombs], ['probes so far', probed]],
      state: {
        label: `${kindName} table, ${capacity} slots: ${slots.map((s, i) => `${i} ${s === null ? 'empty' : s === 'DELETED' ? 'tombstone' : fmtKey(s.key)}`).join(', ')}`,
        slots: view(o),
        probe: o.probe,
        probeRole: o.probeRole,
        strips: [...(o.sequence ? [{ label: 'Probe sequence', items: o.sequence }] : []), opStrip()],
      },
    });
  };

  const dump = (): OpenStep['slots'] => slots.map((s) => (s === null ? null : s === 'DELETED' ? 'DEL' : [s.key, s.value]));

  snap(
    undefined,
    `${mode === 'linear' ? 'HashTableOpenAddressing' : 'HashTableQuadraticProbing'}(${capacity}): ${capacity} empty slots, one key each. ` +
      `A key that finds its home slot taken probes ${mode === 'linear' ? 'the next slot, then the next' : 'slots 1, 3, 6, 10, ... away (triangular numbers)'} until a free one turns up.`,
  );

  ops.forEach((op, n) => {
    current = n;
    const name = formatChainOp(op);
    const k = quoteKey(op.key);
    const start = pyHash(op.key, capacity);
    const opVars: Array<[string, string | number]> = [['op', name], ['home', start]];
    const seq: StripItem[] = [];
    const probes: number[] = [];
    let free: number | null = null;
    let found: number | null = null;
    let ended = false; // met an empty slot

    snap(
      L.hash,
      `${name}: ${hashText(op.key, capacity)}, so the home slot of ${k} is ${start}. ` +
        `Walk the probe sequence (${start} + ${mode === 'linear' ? 'i' : 'i(i+1)/2'}) % ${capacity} for i = 0, 1, 2, ... until ${k} or an empty slot turns up.`,
      { probe: start, probeRole: 'compare', roles: { [start]: 'compare' }, vars: [...opVars, ['free', 'None']] },
    );

    for (let i = 0; i < capacity; i++) {
      const offset = stepOf(mode, i);
      const index = (start + offset) % capacity;
      const slot = slots[index];
      probes.push(index);
      probed += 1;
      const where = `i = ${i}: slot (${start} + ${offset}) % ${capacity} = ${index}`;
      const v = (): Array<[string, string | number]> => [...opVars, ['i', i], ['index', index], ['free', free === null ? 'None' : free]];
      const prior: Record<number, Role> = {};
      for (const p of probes.slice(0, -1)) if (slots[p] !== 'DELETED') prior[p] = 'compare';
      if (slot === null) {
        seq.push({ text: `${index} (+${offset}) empty`, role: 'bad' });
        ended = true;
        const tomb = free;
        // _probe returns (None, index if free is None else free)
        if (free === null) free = index;
        snap(
          L.empty,
          `${where} is empty. ${k} would have been stored here or earlier on this sequence, so it is not in the table. ` +
            (op.kind === 'put' ? `The free slot is ${tomb === null ? `this one, ${index}` : `the tombstone met earlier, ${tomb}`}.` : 'The walk stops.'),
          { probe: index, probeRole: 'bad', roles: { ...prior, [index]: 'bad' }, sequence: [...seq], vars: v() },
        );
        break;
      }
      if (slot === 'DELETED') {
        const first = free === null;
        if (first) free = index;
        seq.push({ text: `${index} (+${offset}) DEL`, role: 'muted' });
        const why =
          op.kind === 'put'
            ? `${k} may still sit further along the sequence, and stopping here would store it twice (the bug fixed in v0.2.0).`
            : `this slot was taken when later keys were inserted, so ${k} may sit further along.`;
        snap(
          L.tomb,
          `${where} holds a tombstone (DEL). ` +
            (first ? `Remember it as the first free slot (free = ${index}), but keep walking: ` : `free stays ${free}, the first tombstone; keep walking: `) +
            why,
          { probe: index, probeRole: 'compare', roles: { ...prior, [index]: 'compare' }, sequence: [...seq], vars: v() },
        );
        continue;
      }
      if (slot.key === op.key) {
        found = index;
        seq.push({ text: `${index} (+${offset}) found`, role: 'good' });
        snap(L.key, `${where} holds ${k}: found after ${i + 1} probe${i ? 's' : ''}.`, {
          probe: index,
          probeRole: 'good',
          roles: { ...prior, [index]: 'good' },
          sequence: [...seq],
          vars: v(),
        });
        break;
      }
      seq.push({ text: `${index} (+${offset})`, role: 'compare' });
      snap(L.key, `${where} holds ${quoteKey(slot.key)}, not ${k}: a collision, so probe the next slot of the sequence.`, {
        probe: index,
        probeRole: 'compare',
        roles: { ...prior, [index]: 'compare' },
        sequence: [...seq],
        vars: v(),
      });
    }

    const last = probes[probes.length - 1];
    if (found === null && !ended) {
      snap(
        L.exhausted,
        `All ${capacity} probes are done and none met an empty slot or ${k}: ${k} is not in the table, and free = ${free === null ? 'None' : free}.` +
          (mode === 'quadratic' && new Set(probes).size < capacity ? ` The steps reached only ${new Set(probes).size} different slots of ${capacity}, because ${capacity} is not a power of two.` : ''),
        {
          probe: last,
          probeRole: 'bad',
          roles: Object.fromEntries(probes.filter((p) => slots[p] !== 'DELETED').map((p) => [p, 'compare' as Role])),
          sequence: [...seq],
          vars: [...opVars, ['free', free === null ? 'None' : free]],
        },
      );
    }

    let result: OpenStep['result'];
    const endVars: Array<[string, string | number]> = [...opVars, ['found', found === null ? 'None' : found], ['free', free === null ? 'None' : free]];
    if (op.kind === 'put') {
      if (found !== null) {
        const s = slots[found] as { key: HKey; value: HVal };
        const before = s.value;
        slots[found] = { key: op.key, value: op.value };
        snap(L.update, `${k} is already in slot ${found}: replace its value ${reprValue(before)} with ${reprValue(op.value)}. size stays ${size}.`, {
          probe: found,
          probeRole: 'good',
          roles: { [found]: 'active' },
          sequence: [...seq],
          vars: endVars,
        });
        result = null;
      } else if (free === null) {
        snap(
          L.full,
          `Exception: Hash table is full. ${k} is new, and its probe sequence met neither an empty slot nor a tombstone, so there is nowhere to put it. ` +
            'The table never resizes; the caller gets the exception and the table is unchanged.',
          { probe: last, probeRole: 'bad', roles: Object.fromEntries(probes.map((p) => [p, 'compare' as Role])), sequence: [...seq], vars: endVars },
        );
        result = 'full';
      } else {
        const reused = slots[free] === 'DELETED';
        slots[free] = { key: op.key, value: op.value };
        size += 1;
        snap(
          L.insert,
          `Store (${k}, ${reprValue(op.value)}) in slot ${free}` +
            (reused ? `, reusing the tombstone: the walk went on past it to make sure ${k} was not further along.` : `, the empty slot that ended the walk.`) +
            ` size = ${size}.`,
          { probe: free, probeRole: 'active', roles: { [free]: 'active' }, sequence: [...seq], vars: endVars },
        );
        result = null;
      }
    } else if (op.kind === 'get') {
      if (found !== null) {
        const s = slots[found] as { key: HKey; value: HVal };
        result = s.value;
        snap(L.get, `get returns ${reprValue(s.value)}, the value in slot ${found}.`, {
          probe: found,
          probeRole: 'good',
          roles: { [found]: 'good' },
          sequence: [...seq],
          vars: endVars,
        });
      } else {
        result = null;
        snap(L.get, `${k} is not in the table: get returns None.`, { probe: last, probeRole: 'bad', sequence: [...seq], vars: endVars });
      }
    } else if (found !== null) {
      slots[found] = 'DELETED';
      size -= 1;
      result = true;
      snap(
        L.remove,
        `Replace slot ${found} with a tombstone, not with None: an empty slot would end the walk of every key stored after it on its probe sequence. size = ${size}; remove returns True.`,
        { probe: found, probeRole: 'active', roles: { [found]: 'active' }, sequence: [...seq], vars: endVars },
      );
    } else {
      result = false;
      snap(L.removeMiss, `${k} is not in the table: remove returns False.`, { probe: last, probeRole: 'bad', sequence: [...seq], vars: endVars });
    }
    steps.push({ op, result, size, slots: dump(), probes });
  });

  current = ops.length;
  const tombs = slots.filter((s) => s === 'DELETED').length;
  snap(
    undefined,
    `Done: ${size} key${size === 1 ? '' : 's'} in ${capacity} slots` +
      (tombs ? `, plus ${tombs} tombstone${tombs === 1 ? '' : 's'} that lookups still walk past (this code never cleans them up).` : '.'),
  );
  return { frames, steps };
}
