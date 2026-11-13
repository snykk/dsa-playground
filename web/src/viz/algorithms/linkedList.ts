/**
 * Linked list tracers: singly, doubly and circular, driven by one operation script.
 *
 * Mirrors, method by method and line by line:
 *   Data_Structures/Linear/Linked_List/Singly/Python/singly_linked_list.py      (SinglyLinkedList)
 *     insert_at_head, insert_at_tail (walks to the last node), delete(key) with prev / curr, display()
 *   Data_Structures/Linear/Linked_List/Doubly/Python/doubly_linked_list.py      (DoublyLinkedList)
 *     insert_at_head, insert_at_tail, delete_value(data) -> bool, traverse_forward / traverse_backward (print)
 *   Data_Structures/Linear/Linked_List/Circular/Python/circular_linked_list.py  (CircularLinkedList)
 *     insert_at_head / insert_at_tail (both walk to the tail), delete_value(key) with the
 *     single-node case first, traverse(limit=None)
 * Every list keeps only a head pointer, as the Python classes do. Golden fixtures
 * (__fixtures__/lists.json, written by web/scripts/gen_lists_fixtures.py) pin the list after
 * every operation, the backward walk of the doubly linked list and every return value.
 *
 * Input: "head 1, head 2, tail 4, delete 2, display"  (h / t / d for short; "tail 1 2 3" inserts three)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { ChainLinkView, ChainNodeView, ChainPointerView, ChainState } from '../renderers/ChainView';
import type { StripData, StripItem } from '../ui/molecules/Strip';

export type ListKind = 'singly' | 'doubly' | 'circular';

export type ListOp =
  | { kind: 'head'; value: number }
  | { kind: 'tail'; value: number }
  | { kind: 'delete'; value: number }
  /** display() / traverse_forward() / traverse(limit). */
  | { kind: 'traverse'; limit?: number }
  /** traverse_backward(), doubly linked list only. */
  | { kind: 'backward' };

export interface ListStep {
  op: ListOp;
  /** Values from the head along next links (one lap for the circular list). */
  values: number[];
  /** Doubly: values from the last node along prev links. */
  backward?: number[];
  /** Circular: following next from the head comes back to the head (true for an empty list). */
  closed?: boolean;
  /**
   * What the Python method returns or prints: display() / traverse() -> the list, delete_value
   * (doubly) -> True / False, traverse_forward / traverse_backward -> the printed line; else null.
   */
  result: number[] | boolean | string | null;
}

export interface ListRun {
  frames: Array<Frame<ChainState>>;
  steps: ListStep[];
}

export const LIST_LIMITS = { maxOps: 30, maxNodes: 10 };

const SPLIT = /[;,\n]+/;
const VALUE = /^-?\d{1,3}$/;
const NAMES: Record<string, ListOp['kind']> = {
  head: 'head',
  h: 'head',
  insertathead: 'head',
  inserthead: 'head',
  pushfront: 'head',
  prepend: 'head',
  tail: 'tail',
  t: 'tail',
  insertattail: 'tail',
  inserttail: 'tail',
  pushback: 'tail',
  append: 'tail',
  delete: 'delete',
  del: 'delete',
  d: 'delete',
  deletevalue: 'delete',
  deletenode: 'delete',
  remove: 'delete',
  rm: 'delete',
  display: 'traverse',
  traverse: 'traverse',
  traverseforward: 'traverse',
  forward: 'traverse',
  print: 'traverse',
  show: 'traverse',
  walk: 'traverse',
  backward: 'backward',
  back: 'backward',
  traversebackward: 'backward',
};

const TRAVERSE_NAME: Record<ListKind, string> = { singly: 'display', doubly: 'forward', circular: 'traverse' };

function readValue(token: string, raw: string): number {
  if (!VALUE.test(token)) throw new InputError(`"${token}" in "${raw}" is not a whole number from -99 to 999.`);
  const v = Number(token);
  if (v < -99) throw new InputError(`${v} is too small: values go from -99 to 999.`);
  return v;
}

/**
 * Parse an operation script for one kind of list. Several values after head / tail / delete
 * give one operation each. The size is simulated so the picture never holds more than
 * maxNodes nodes.
 */
export function parseListOps(text: string, kind: ListKind, { maxOps = LIST_LIMITS.maxOps, maxNodes = LIST_LIMITS.maxNodes } = {}): ListOp[] {
  const ops: ListOp[] = [];
  const walk = TRAVERSE_NAME[kind];
  for (const raw of text.split(SPLIT).map((t) => t.trim()).filter(Boolean)) {
    const words = raw.replace(/[()]/g, ' ').trim().split(/\s+/);
    const name = words[0].toLowerCase().replace(/[_-]/g, '');
    const args = words.slice(1);
    const op = NAMES[name];
    if (!op) {
      throw new InputError(
        `Cannot read "${raw}". Write operations like "head 5", "tail 7", "delete 5" or "${walk}"${kind === 'doubly' ? ' or "backward"' : ''}, separated by commas.`,
      );
    }
    if (op === 'head' || op === 'tail' || op === 'delete') {
      if (args.length === 0) throw new InputError(`"${raw}" needs a value, e.g. "${words[0]} 5".`);
      for (const a of args) ops.push({ kind: op, value: readValue(a, raw) });
      continue;
    }
    if (op === 'backward') {
      if (kind !== 'doubly') throw new InputError(`"${raw}": only the doubly linked list has prev links to walk backward.`);
      if (args.length) throw new InputError(`"${raw}": the backward traversal takes no value.`);
      ops.push({ kind: 'backward' });
      continue;
    }
    if (args.length === 0) {
      ops.push({ kind: 'traverse' });
      continue;
    }
    if (kind !== 'circular' || args.length > 1 || !/^\d{1,2}$/.test(args[0]) || Number(args[0]) < 1) {
      throw new InputError(
        kind === 'circular'
          ? `"${raw}": traverse takes an optional limit from 1 to 99, e.g. "traverse 3".`
          : `"${raw}": ${kind === 'singly' ? 'display()' : 'traverse_forward()'} takes no value (only the circular list's traverse has a limit).`,
      );
    }
    ops.push({ kind: 'traverse', limit: Number(args[0]) });
  }
  if (ops.length === 0) throw new InputError('Add at least one operation, e.g. "head 3, tail 7, delete 3".');
  if (ops.length > maxOps) throw new InputError(`At most ${maxOps} operations, please (got ${ops.length}).`);
  const model: number[] = [];
  ops.forEach((op, i) => {
    if (op.kind === 'head') model.unshift(op.value);
    else if (op.kind === 'tail') model.push(op.value);
    else if (op.kind === 'delete') {
      const at = model.indexOf(op.value);
      if (at >= 0) model.splice(at, 1);
    }
    if (model.length > maxNodes) {
      throw new InputError(`At most ${maxNodes} nodes at once, so the picture stays readable (operation ${i + 1} would make ${model.length}).`);
    }
  });
  return ops;
}

/** The Python call an operation stands for. */
export function formatListOp(kind: ListKind, op: ListOp): string {
  switch (op.kind) {
    case 'head':
      return `insert_at_head(${op.value})`;
    case 'tail':
      return `insert_at_tail(${op.value})`;
    case 'delete':
      return kind === 'singly' ? `delete(${op.value})` : `delete_value(${op.value})`;
    case 'backward':
      return 'traverse_backward()';
    default:
      if (kind === 'singly') return 'display()';
      if (kind === 'doubly') return 'traverse_forward()';
      return op.limit === undefined ? 'traverse()' : `traverse(${op.limit})`;
  }
}

interface LNode {
  id: number;
  data: number;
  next: LNode | null;
  prev: LNode | null;
}

type Ptr = [name: string, target: LNode | null, role?: Role, side?: 'above' | 'below'];

interface SnapOpts {
  roles?: Array<[LNode | null, Role]>;
  /** Links to color: the node, which of its two links, the role. */
  links?: Array<[LNode | null, 'next' | 'prev', Role]>;
  /** Named references besides head, nearest to the box first. */
  ptrs?: Ptr[];
  headRole?: Role;
  vars?: Array<[string, string | number]>;
}

/** Row a node is lifted to while it is linked in, and where a removed node leaves from. */
const LIFT = 0.8;

const NOTE: Record<ListKind, string> = {
  singly: 'Each arrow is a next link; the last node points to None.',
  doubly: 'Upper arrows are next links, lower arrows are prev links.',
  circular: "The arrow under the row is the last node's next link, back to the head.",
};

const NEW_NAME: Record<ListKind, string> = { singly: 'node', doubly: 'new_node', circular: 'new_node' };

/** Trace an operation script on one kind of list, as the repository's Python class runs it. */
export function traceLinkedList(kind: ListKind, ops: ListOp[]): ListRun {
  let head: LNode | null = null;
  let nextId = 1;
  /** Nodes on the row, left to right, as the reader should see them laid out. */
  let row: LNode[] = [];
  const lifted = new Set<LNode>();
  let ghost: { node: LNode; col: number } | null = null;
  let current = -1;
  let output: { label: string; items: StripItem[] } | null = null;
  const frames: Array<Frame<ChainState>> = [];
  const steps: ListStep[] = [];
  const newName = NEW_NAME[kind];

  const mk = (data: number): LNode => ({ id: nextId++, data, next: null, prev: null });

  /** Nodes from the head along next links; stops after one lap of a ring (or at any repeat mid-update). */
  const forward = (): LNode[] => {
    const out: LNode[] = [];
    const seen = new Set<LNode>();
    for (let x = head; x && !seen.has(x); x = x.next) {
      seen.add(x);
      out.push(x);
    }
    return out;
  };
  const count = () => forward().length;
  const listText = () => {
    const vals = forward().map((n) => n.data);
    if (vals.length === 0) return 'the list is empty';
    return kind === 'circular' ? `${vals.join(' -> ')} -> back to ${vals[0]}` : `${vals.join(' -> ')} -> None`;
  };
  const name = (n: LNode | null) => (n ? String(n.data) : 'None');

  const strips = (): StripData[] => {
    const s: StripData[] = [
      {
        label: 'Operations',
        items: ops.map((op, i) => ({ text: formatListOp(kind, op), role: i === current ? 'active' : i < current ? 'muted' : undefined })),
      },
    ];
    if (output) s.push({ label: output.label, items: [...output.items] });
    return s;
  };

  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const roles = new Map<number, Role>();
    for (const [n, r] of o.roles ?? []) if (n) roles.set(n.id, r);
    const linkRoles = new Map<string, Role>();
    for (const [n, k, r] of o.links ?? []) if (n) linkRoles.set(`${n.id}${k}`, r);
    const nodes: ChainNodeView[] = row.map((nd, col) => ({
      id: nd.id,
      label: nd.data,
      col,
      row: lifted.has(nd) ? LIFT : 0,
      role: roles.get(nd.id) ?? 'idle',
    }));
    const drawn = [...row];
    if (ghost) {
      nodes.push({ id: ghost.node.id, label: ghost.node.data, col: ghost.col, row: LIFT, ghost: true, role: roles.get(ghost.node.id) ?? 'muted' });
      drawn.push(ghost.node);
    }
    const links: ChainLinkView[] = [];
    for (const nd of drawn) {
      links.push({ from: nd.id, to: nd.next ? nd.next.id : null, kind: 'next', role: linkRoles.get(`${nd.id}next`) });
      if (kind === 'doubly') links.push({ from: nd.id, to: nd.prev ? nd.prev.id : null, kind: 'prev', role: linkRoles.get(`${nd.id}prev`) });
    }
    const pointers: ChainPointerView[] = [{ name: 'head', target: head ? head.id : null, role: o.headRole }];
    for (const [pname, target, role, side] of o.ptrs ?? []) pointers.push({ name: pname, target: target ? target.id : null, role, side });
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['nodes', count()], ['head', name(head)]],
      state: { nodes, links, pointers, note: NOTE[kind], strips: strips() },
    });
  };

  /** Remove a node from the row and draw it once more, faded, below its old place. */
  const leave = (node: LNode) => {
    const col = row.indexOf(node);
    row = row.filter((n) => n !== node);
    ghost = { node, col: Math.max(0, col) };
  };

  // ---- singly linked list (singly_linked_list.py) ----

  const singlyHead = (v: number, vars: Array<[string, string | number]>) => {
    const node = mk(v);
    row = [node, ...row];
    lifted.add(node);
    const np: Ptr = [newName, node, 'active', 'below'];
    snap(1, `node = Node(${v}): a new node holding ${v}; its next is None for now.${head ? ' The list slides right to make room at the front.' : ''}`, {
      roles: [[node, 'active']],
      ptrs: [np],
      vars,
    });
    node.next = head;
    snap(
      2,
      head
        ? `node.next = self.head: the new node now points at ${head.data}, the current first node. This write comes first: moving head before it would lose the whole list.`
        : 'node.next = self.head, which is None: the list was empty, so the new node is also the last one.',
      { roles: [[node, 'active']], links: [[node, 'next', 'active']], ptrs: [np], vars },
    );
    head = node;
    snap(3, `self.head = node: the list now starts at ${v}. Two pointer writes and no walk, so insert_at_head is O(1) however long the list is.`, {
      roles: [[node, 'active']],
      headRole: 'active',
      ptrs: [[newName, node, undefined, 'below']],
      vars,
    });
    lifted.delete(node);
    snap(3, `${v} settles at the front: ${listText()}.`, { roles: [[node, 'done']], vars });
  };

  const singlyTail = (v: number, vars: Array<[string, string | number]>) => {
    const node = mk(v);
    row = [...row, node];
    lifted.add(node);
    const np: Ptr = [newName, node, 'active', 'below'];
    snap(5, `node = Node(${v}): a new node holding ${v}, with next = None. It must go after the last node.`, { roles: [[node, 'active']], ptrs: [np], vars });
    if (!head) {
      head = node;
      snap(6, 'self.head is None: the list is empty, so self.head = node and return. No walk is needed.', {
        roles: [[node, 'active']],
        headRole: 'active',
        ptrs: [[newName, node, undefined, 'below']],
        vars,
      });
      lifted.delete(node);
      snap(6, `${v} settles as the only node: ${listText()}.`, { roles: [[node, 'done']], vars });
      return;
    }
    let curr: LNode = head;
    let walked = 0;
    snap(7, `curr = self.head (${curr.data}). The list stores no tail pointer, so the last node has to be found by walking.`, {
      roles: [
        [curr, 'compare'],
        [node, 'active'],
      ],
      ptrs: [['curr', curr, 'compare'], np],
      vars: [...vars, ['steps', walked]],
    });
    while (curr.next) {
      const from: LNode = curr;
      curr = curr.next;
      walked++;
      snap(8, `curr.next is ${curr.data}, not None, so ${from.data} is not the last node: curr = curr.next (${curr.data}). Step ${walked}.`, {
        roles: [
          [curr, 'compare'],
          [node, 'active'],
        ],
        links: [[from, 'next', 'compare']],
        ptrs: [['curr', curr, 'compare'], np],
        vars: [...vars, ['steps', walked]],
      });
    }
    snap(
      8,
      walked === 0
        ? `curr.next is None: ${curr.data}, the only node, is also the last one. With more nodes this walk visits them all, which makes insert_at_tail O(n).`
        : `curr.next is None: ${curr.data} is the last node, found after ${walked} step${walked === 1 ? '' : 's'}. This walk makes insert_at_tail O(n); a stored tail pointer would make it O(1).`,
      {
        roles: [
          [curr, 'active'],
          [node, 'active'],
        ],
        ptrs: [['curr', curr, 'active'], np],
        vars: [...vars, ['steps', walked]],
      },
    );
    curr.next = node;
    snap(9, `curr.next = node: ${curr.data} now points at the new node, whose next is None, so ${v} is the new last node.`, {
      roles: [[node, 'active']],
      links: [[curr, 'next', 'active']],
      ptrs: [['curr', curr], np],
      vars: [...vars, ['steps', walked]],
    });
    lifted.delete(node);
    snap(9, `${v} settles at the end: ${listText()}.`, { roles: [[node, 'done']], vars: [...vars, ['steps', walked]] });
  };

  const singlyDelete = (key: number, vars: Array<[string, string | number]>) => {
    let curr: LNode | null = head;
    let prev: LNode | null = null;
    let walked = 0;
    snap(
      11,
      head
        ? `delete(${key}): walk with two references. curr = self.head (${head.data}) and prev = None, because the head has no node before it.`
        : `delete(${key}): curr = self.head, which is None (the list is empty), and prev = None.`,
      { roles: [[curr, 'compare']], ptrs: [['curr', curr, 'compare'], ['prev', null]], vars },
    );
    while (curr && curr.data !== key) {
      const was: LNode = curr;
      prev = curr;
      curr = curr.next;
      walked++;
      snap(12, `${was.data} is not ${key}, so keep walking: prev = curr (${was.data}), curr = curr.next (${name(curr)}).`, {
        roles: [[curr, 'compare']],
        links: [[was, 'next', 'compare']],
        ptrs: [
          ['curr', curr, 'compare'],
          ['prev', prev],
        ],
        vars: [...vars, ['steps', walked]],
      });
    }
    if (!curr) {
      snap(13, head ? `curr is None: the walk passed every node without finding ${key}, so delete returns and the list is unchanged.` : 'curr is None: the list is empty, so delete returns and nothing changes.', {
        ptrs: [
          ['curr', null],
          ['prev', prev],
        ],
        vars: [...vars, ['steps', walked]],
      });
      return;
    }
    const match: LNode = curr;
    snap(12, `curr.data == ${key}: the first node holding ${key} is found${prev ? `, and prev (${prev.data}) is the node before it` : ' at the head'}.`, {
      roles: [[match, 'active']],
      ptrs: [
        ['curr', match, 'active'],
        ['prev', prev],
      ],
      vars: [...vars, ['steps', walked]],
    });
    if (prev) {
      prev.next = match.next;
      snap(
        14,
        `prev.next = curr.next: ${prev.data} now points ${match.next ? `at ${match.next.data}` : 'to None'}, past ${key}. No node in the list leads to ${key} any more.`,
        {
          roles: [[match, 'active']],
          links: [[prev, 'next', 'active']],
          ptrs: [
            ['curr', match, 'active'],
            ['prev', prev],
          ],
          vars: [...vars, ['steps', walked]],
        },
      );
    } else {
      head = match.next;
      snap(
        15,
        `prev is None, so the match is the head: self.head = curr.next${match.next ? ` (${match.next.data})` : ', which is None: the list is now empty'}.`,
        { roles: [[match, 'active']], headRole: 'active', ptrs: [['curr', match, 'active'], ['prev', null]], vars: [...vars, ['steps', walked]] },
      );
    }
    leave(match);
    snap(prev ? 14 : 15, `The unlinked node leaves: nothing refers to it, so Python's garbage collector frees it (the C++ version calls delete). Now ${listText()}.`, {
      vars: [...vars, ['steps', walked]],
    });
  };

  const singlyDisplay = (vars: Array<[string, string | number]>): number[] => {
    const elems: number[] = [];
    const seen: Array<[LNode, Role]> = [];
    let curr: LNode | null = head;
    output = { label: 'elems', items: [] };
    snap(17, `display(): elems = [] and curr = self.head${head ? ` (${head.data})` : ', which is None'}.`, {
      roles: [[curr, 'compare']],
      ptrs: [['curr', curr, 'compare']],
      vars,
    });
    while (curr) {
      const was: LNode = curr;
      elems.push(was.data);
      seen.push([was, 'done']);
      output.items.push({ text: String(was.data) });
      curr = was.next;
      snap(18, `elems.append(${was.data}), then curr = curr.next (${name(curr)}).`, {
        roles: [...seen, [curr, 'compare']],
        links: [[was, 'next', 'compare']],
        ptrs: [['curr', curr, 'compare']],
        vars,
      });
    }
    snap(19, `curr is None: return [${elems.join(', ')}]. One visit per node, so display is O(n).`, { roles: seen, ptrs: [['curr', null]], vars });
    return elems;
  };

  // ---- doubly linked list (doubly_linked_list.py) ----

  const doublyHead = (v: number, vars: Array<[string, string | number]>) => {
    const node = mk(v);
    row = [node, ...row];
    lifted.add(node);
    const np: Ptr = [newName, node, 'active', 'below'];
    snap(1, `new_node = Node(${v}): prev and next are both None.${head ? ' The list slides right to make room at the front.' : ''}`, { roles: [[node, 'active']], ptrs: [np], vars });
    if (head) {
      const old: LNode = head;
      old.prev = node;
      snap(3, `self.head is ${old.data}, not None, so link the two nodes both ways. First self.head.prev = new_node: ${old.data}'s backward link points at ${v}.`, {
        roles: [[node, 'active']],
        links: [[old, 'prev', 'active']],
        ptrs: [np],
        vars,
      });
      node.next = old;
      snap(4, `new_node.next = self.head: ${v}'s forward link points at ${old.data}. The two links now mirror each other.`, {
        roles: [[node, 'active']],
        links: [[node, 'next', 'active']],
        ptrs: [np],
        vars,
      });
    } else {
      snap(2, 'self.head is None: there is no old head to link, so both writes are skipped and the new node keeps two None links.', {
        roles: [[node, 'active']],
        ptrs: [np],
        vars,
      });
    }
    head = node;
    snap(5, `self.head = new_node: the list starts at ${v}. At most three writes and no walk, so insert_at_head is O(1).`, {
      roles: [[node, 'active']],
      headRole: 'active',
      ptrs: [[newName, node, undefined, 'below']],
      vars,
    });
    lifted.delete(node);
    snap(5, `${v} settles at the front: ${listText()}.`, { roles: [[node, 'done']], vars });
  };

  const doublyTail = (v: number, vars: Array<[string, string | number]>) => {
    const node = mk(v);
    row = [...row, node];
    lifted.add(node);
    const np: Ptr = [newName, node, 'active', 'below'];
    snap(6, `new_node = Node(${v}): prev and next are both None. It must go after the last node.`, { roles: [[node, 'active']], ptrs: [np], vars });
    if (!head) {
      head = node;
      snap(7, 'self.head is None: the list is empty, so self.head = new_node and return.', {
        roles: [[node, 'active']],
        headRole: 'active',
        ptrs: [[newName, node, undefined, 'below']],
        vars,
      });
      lifted.delete(node);
      snap(7, `${v} settles as the only node: ${listText()}.`, { roles: [[node, 'done']], vars });
      return;
    }
    let temp: LNode = head;
    let walked = 0;
    snap(8, `temp = self.head (${temp.data}). There is no tail pointer, so walk to the last node.`, {
      roles: [
        [temp, 'compare'],
        [node, 'active'],
      ],
      ptrs: [['temp', temp, 'compare'], np],
      vars: [...vars, ['steps', walked]],
    });
    while (temp.next) {
      const from: LNode = temp;
      temp = temp.next;
      walked++;
      snap(9, `temp.next is ${temp.data}, not None: temp = temp.next (${temp.data}). Step ${walked}.`, {
        roles: [
          [temp, 'compare'],
          [node, 'active'],
        ],
        links: [[from, 'next', 'compare']],
        ptrs: [['temp', temp, 'compare'], np],
        vars: [...vars, ['steps', walked]],
      });
    }
    snap(9, walked === 0 ? `temp.next is None: ${temp.data}, the only node, is also the last one.` : `temp.next is None: ${temp.data} is the last node, found after ${walked} step${walked === 1 ? '' : 's'}. The walk makes insert_at_tail O(n) here.`, {
      roles: [
        [temp, 'active'],
        [node, 'active'],
      ],
      ptrs: [['temp', temp, 'active'], np],
      vars: [...vars, ['steps', walked]],
    });
    temp.next = node;
    snap(10, `temp.next = new_node: ${temp.data}'s forward link points at ${v}.`, {
      roles: [[node, 'active']],
      links: [[temp, 'next', 'active']],
      ptrs: [['temp', temp], np],
      vars: [...vars, ['steps', walked]],
    });
    node.prev = temp;
    snap(11, `new_node.prev = temp: ${v}'s backward link points at ${temp.data}, so both directions agree.`, {
      roles: [[node, 'active']],
      links: [[node, 'prev', 'active']],
      ptrs: [['temp', temp], np],
      vars: [...vars, ['steps', walked]],
    });
    lifted.delete(node);
    snap(11, `${v} settles at the end: ${listText()}.`, { roles: [[node, 'done']], vars: [...vars, ['steps', walked]] });
  };

  const doublyDelete = (key: number, vars: Array<[string, string | number]>): boolean => {
    let temp: LNode | null = head;
    let walked = 0;
    snap(13, `delete_value(${key}): temp = self.head${head ? ` (${head.data})` : ', which is None (the list is empty)'}.`, {
      roles: [[temp, 'compare']],
      ptrs: [['temp', temp, 'compare']],
      vars,
    });
    while (temp) {
      if (temp.data === key) {
        const match: LNode = temp;
        const before = match.prev;
        const after = match.next;
        const tp: Ptr = ['temp', match, 'active'];
        snap(15, `temp.data == ${key}: found the first node holding ${key}. Its neighbours must now skip it in both directions.`, {
          roles: [[match, 'active']],
          ptrs: [tp],
          vars: [...vars, ['steps', walked]],
        });
        if (before) {
          before.next = after;
          snap(16, `temp.prev is ${before.data}: temp.prev.next = temp.next, so ${before.data}'s forward link ${after ? `jumps to ${after.data}` : 'becomes None'}.`, {
            roles: [[match, 'active']],
            links: [[before, 'next', 'active']],
            ptrs: [tp],
            vars: [...vars, ['steps', walked]],
          });
        } else {
          head = after;
          snap(17, `temp.prev is None, so ${key} is the head: self.head = temp.next${after ? ` (${after.data})` : ', which is None: the list is now empty'}.`, {
            roles: [[match, 'active']],
            headRole: 'active',
            ptrs: [tp],
            vars: [...vars, ['steps', walked]],
          });
        }
        if (after) {
          after.prev = before;
          snap(18, `temp.next is ${after.data}: temp.next.prev = temp.prev, so ${after.data}'s backward link ${before ? `jumps to ${before.data}` : 'becomes None'}.`, {
            roles: [[match, 'active']],
            links: [[after, 'prev', 'active']],
            ptrs: [tp],
            vars: [...vars, ['steps', walked]],
          });
        } else {
          snap(18, `temp.next is None (${key} was the last node): there is no backward link to fix.`, {
            roles: [[match, 'active']],
            ptrs: [tp],
            vars: [...vars, ['steps', walked]],
          });
        }
        leave(match);
        snap(19, `return True: ${key} is skipped both ways and the garbage collector reclaims it (the C++ version calls delete). Now ${listText()}.`, {
          vars: [...vars, ['steps', walked]],
        });
        return true;
      }
      const from: LNode = temp;
      temp = temp.next;
      walked++;
      snap(20, `temp.data = ${from.data} is not ${key}: temp = temp.next (${name(temp)}).`, {
        roles: [[temp, 'compare']],
        links: [[from, 'next', 'compare']],
        ptrs: [['temp', temp, 'compare']],
        vars: [...vars, ['steps', walked]],
      });
    }
    snap(21, `temp is None: no node holds ${key}, so delete_value returns False and nothing changes.`, {
      ptrs: [['temp', null]],
      vars: [...vars, ['steps', walked]],
    });
    return false;
  };

  const printedText = (vals: number[]) => `${vals.map((v) => `${v} -> `).join('')}None`;

  const doublyForward = (vars: Array<[string, string | number]>): string => {
    let temp: LNode | null = head;
    const vals: number[] = [];
    const seen: Array<[LNode, Role]> = [];
    output = { label: 'Printed', items: [] };
    snap(22, `traverse_forward(): temp = self.head${head ? ` (${head.data})` : ', which is None'}.`, { roles: [[temp, 'compare']], ptrs: [['temp', temp, 'compare']], vars });
    while (temp) {
      const was: LNode = temp;
      vals.push(was.data);
      seen.push([was, 'done']);
      output.items.push({ text: `${was.data} ->` });
      temp = was.next;
      snap(23, `print(${was.data}, end=" -> "), then temp = temp.next (${name(temp)}).`, {
        roles: [...seen, [temp, 'compare']],
        links: [[was, 'next', 'compare']],
        ptrs: [['temp', temp, 'compare']],
        vars,
      });
    }
    output.items.push({ text: 'None' });
    snap(24, `temp is None: print("None"). The output is "${printedText(vals)}".`, { roles: seen, ptrs: [['temp', null]], vars });
    return printedText(vals);
  };

  const doublyBackward = (vars: Array<[string, string | number]>): string => {
    let temp: LNode | null = head;
    output = { label: 'Printed', items: [] };
    if (!temp) {
      output.items.push({ text: 'None' });
      snap(25, 'traverse_backward(): temp = self.head is None, so print("None") and return.', { ptrs: [['temp', null]], vars });
      return 'None';
    }
    snap(25, `traverse_backward(): temp = self.head (${temp.data}). First walk forward to the last node: the list keeps no tail pointer.`, {
      roles: [[temp, 'compare']],
      ptrs: [['temp', temp, 'compare']],
      vars,
    });
    while (temp.next) {
      const from: LNode = temp;
      temp = temp.next;
      snap(26, `temp.next is ${temp.data}, not None: temp = temp.next (${temp.data}).`, {
        roles: [[temp, 'compare']],
        links: [[from, 'next', 'compare']],
        ptrs: [['temp', temp, 'compare']],
        vars,
      });
    }
    const vals: number[] = [];
    const seen: Array<[LNode, Role]> = [];
    let back: LNode | null = temp;
    while (back) {
      const was: LNode = back;
      vals.push(was.data);
      seen.push([was, 'done']);
      output.items.push({ text: `${was.data} ->` });
      back = was.prev;
      snap(27, `print(${was.data}, end=" -> "), then temp = temp.prev (${name(back)}): follow the backward link.`, {
        roles: [...seen, [back, 'compare']],
        links: [[was, 'prev', 'compare']],
        ptrs: [['temp', back, 'compare']],
        vars,
      });
    }
    output.items.push({ text: 'None' });
    snap(28, `temp is None: print("None"). The output is "${printedText(vals)}", the list read backward through the prev links.`, {
      roles: seen,
      ptrs: [['temp', null]],
      vars,
    });
    return printedText(vals);
  };

  // ---- circular linked list (circular_linked_list.py) ----

  /** Walk temp from the head to the tail (the node whose next is the head). */
  const walkToTail = (lines: [number, number], cursor: string, others: Ptr[], baseRoles: Array<[LNode | null, Role]>, vars: Array<[string, string | number]>): LNode => {
    let temp = head as LNode;
    let walked = 0;
    snap(lines[0], `${cursor} = self.head (${temp.data}). The tail is the node whose next is the head, and only a walk finds it.`, {
      roles: [...baseRoles, [temp, 'compare']],
      ptrs: [[cursor, temp, 'compare'], ...others],
      vars: [...vars, ['steps', walked]],
    });
    while (temp.next !== head) {
      const from: LNode = temp;
      temp = temp.next as LNode;
      walked++;
      snap(lines[1], `${cursor}.next is ${temp.data}, not the head: ${cursor} = ${cursor}.next (${temp.data}). Step ${walked}.`, {
        roles: [...baseRoles, [temp, 'compare']],
        links: [[from, 'next', 'compare']],
        ptrs: [[cursor, temp, 'compare'], ...others],
        vars: [...vars, ['steps', walked]],
      });
    }
    snap(lines[1], walked === 0 ? `${cursor}.next is the head: ${temp.data} is the only node, so it is also the tail.` : `${cursor}.next is the head: ${temp.data} is the tail, found after ${walked} step${walked === 1 ? '' : 's'}. That walk is the O(n).`, {
      roles: [...baseRoles, [temp, 'active']],
      links: [[temp, 'next', 'compare']],
      ptrs: [[cursor, temp, 'active'], ...others],
      vars: [...vars, ['steps', walked]],
    });
    return temp;
  };

  const circularInsert = (v: number, atHead: boolean, vars: Array<[string, string | number]>) => {
    const node = mk(v);
    row = atHead ? [node, ...row] : [...row, node];
    lifted.add(node);
    const np: Ptr = [newName, node, 'active', 'below'];
    const base = atHead ? 0 : 8;
    snap(
      base + 1,
      `new_node = Node(${v}), with next = None for now.${head ? (atHead ? ' The ring slides right to make room at the front.' : ' It goes after the tail.') : ''}`,
      { roles: [[node, 'active']], ptrs: [np], vars },
    );
    if (!head) {
      head = node;
      node.next = head;
      snap(base + 2, 'self.head is None: the list is empty. self.head = new_node and new_node.next = self.head: a single node that points to itself.', {
        roles: [[node, 'active']],
        headRole: 'active',
        links: [[node, 'next', 'active']],
        ptrs: [[newName, node, undefined, 'below']],
        vars,
      });
      lifted.delete(node);
      snap(base + 2, `${v} settles as the only node: it is the head and the tail at once.`, { roles: [[node, 'done']], vars });
      return;
    }
    const tail = walkToTail(atHead ? [3, 4] : [11, 11], 'temp', [np], [[node, 'active']], vars);
    const tp: Ptr = ['temp', tail];
    if (atHead) {
      const old = head;
      node.next = old;
      snap(5, `new_node.next = self.head: ${v} points at ${old.data}, the old first node.`, {
        roles: [[node, 'active']],
        links: [[node, 'next', 'active']],
        ptrs: [tp, np],
        vars,
      });
      head = node;
      snap(6, `self.head = new_node: the ring now starts at ${v}, but the tail still points at ${old.data}.`, {
        roles: [[node, 'active']],
        headRole: 'active',
        ptrs: [tp, np],
        vars,
      });
      tail.next = head;
      snap(7, `temp.next = self.head: the tail ${tail.data} now points at ${v}, which closes the ring again.`, {
        roles: [[node, 'active']],
        links: [[tail, 'next', 'active']],
        ptrs: [tp, np],
        vars,
      });
      lifted.delete(node);
      snap(7, `${v} settles at the front: ${listText()}.`, { roles: [[node, 'done']], vars });
      return;
    }
    tail.next = node;
    snap(12, `temp.next = new_node: the old tail ${tail.data} points at ${v}.`, {
      roles: [[node, 'active']],
      links: [[tail, 'next', 'active']],
      ptrs: [tp, np],
      vars,
    });
    node.next = head;
    snap(13, `new_node.next = self.head: ${v} points back at ${head.data}, closing the ring. The head does not change.`, {
      roles: [[node, 'active']],
      links: [[node, 'next', 'active']],
      ptrs: [tp, np],
      vars,
    });
    lifted.delete(node);
    snap(13, `${v} settles as the new tail: ${listText()}.`, { roles: [[node, 'done']], vars });
  };

  const circularDelete = (key: number, vars: Array<[string, string | number]>) => {
    if (!head) {
      snap(15, `delete_value(${key}): self.head is None, the list is empty, so return.`, { vars });
      return;
    }
    if (head.next === head) {
      const only: LNode = head;
      if (only.data !== key) {
        snap(18, `self.head.next is self.head: a single node, holding ${only.data}, not ${key}. Return without changes.`, { roles: [[only, 'compare']], vars });
        return;
      }
      snap(16, `self.head.next is self.head: a single node, both the head and the tail, and it holds ${key}. This case is handled first.`, {
        roles: [[only, 'active']],
        links: [[only, 'next', 'compare']],
        vars,
      });
      head = null;
      snap(
        17,
        'self.head = None: the list is empty. Moving head to head.next instead would change nothing here: head.next is the node itself.',
        { roles: [[only, 'active']], headRole: 'active', vars },
      );
      leave(only);
      snap(17, `The node leaves: nothing refers to it, so the garbage collector frees it (the C++ version deletes it first). ${listText()}.`, { vars });
      return;
    }
    let curr: LNode = head;
    let prev: LNode | null = null;
    let walked = 0;
    snap(19, `delete_value(${key}): curr = self.head (${curr.data}) and prev = None.`, {
      roles: [[curr, 'compare']],
      ptrs: [
        ['curr', curr, 'compare'],
        ['prev', null],
      ],
      vars,
    });
    for (;;) {
      if (curr.data === key) {
        const match: LNode = curr;
        snap(20, `curr.data == ${key}: found it${prev ? `, and prev (${prev.data}) is the node before it` : ' at the head'}.`, {
          roles: [[match, 'active']],
          ptrs: [
            ['curr', match, 'active'],
            ['prev', prev],
          ],
          vars: [...vars, ['steps', walked]],
        });
        if (prev) {
          prev.next = match.next;
          snap(21, `prev.next = curr.next: ${prev.data} now points at ${name(match.next)}, skipping ${key}.`, {
            roles: [[match, 'active']],
            links: [[prev, 'next', 'active']],
            ptrs: [
              ['curr', match, 'active'],
              ['prev', prev],
            ],
            vars: [...vars, ['steps', walked]],
          });
        } else {
          const cp: Ptr = ['curr', match, 'active'];
          const tail = walkToTail([22, 22], 'tail', [cp], [[match, 'active']], vars);
          head = match.next;
          snap(23, `self.head = curr.next: the ring now starts at ${name(head)}.`, {
            roles: [[match, 'active']],
            headRole: 'active',
            ptrs: [['tail', tail], cp],
            vars,
          });
          tail.next = head;
          snap(
            23,
            `tail.next = self.head: the tail ${tail.data} skips the old head and points at ${name(head)}. Without this write the ring would still lead to the deleted node.`,
            { roles: [[match, 'active']], links: [[tail, 'next', 'active']], ptrs: [['tail', tail], cp], vars },
          );
        }
        leave(match);
        snap(24, `return: ${key} is unlinked and the garbage collector frees it (the C++ version calls delete). Now ${listText()}.`, { vars });
        return;
      }
      const was: LNode = curr;
      prev = curr;
      curr = curr.next as LNode;
      walked++;
      if (curr === head) {
        snap(25, `${was.data} is not ${key}, and curr = curr.next is the head again: a full lap without finding ${key}. Break: nothing changes.`, {
          roles: [[curr, 'compare']],
          links: [[was, 'next', 'compare']],
          ptrs: [
            ['curr', curr, 'compare'],
            ['prev', prev],
          ],
          vars: [...vars, ['steps', walked]],
        });
        return;
      }
      snap(25, `${was.data} is not ${key}: prev = curr (${was.data}), curr = curr.next (${curr.data}).`, {
        roles: [[curr, 'compare']],
        links: [[was, 'next', 'compare']],
        ptrs: [
          ['curr', curr, 'compare'],
          ['prev', prev],
        ],
        vars: [...vars, ['steps', walked]],
      });
    }
  };

  const circularTraverse = (limit: number | undefined, vars: Array<[string, string | number]>): number[] => {
    const elements: number[] = [];
    output = { label: 'elements', items: [] };
    const call = limit === undefined ? 'traverse()' : `traverse(${limit})`;
    if (!head) {
      snap(27, `${call}: self.head is None, so return [].`, { vars });
      return elements;
    }
    let temp: LNode = head;
    let n = 0;
    const seen: Array<[LNode, Role]> = [];
    snap(28, `${call}: temp = self.head (${temp.data}), count = 0. There is no None to stop at: the walk stops when it is back at the head${limit === undefined ? '' : ' or the limit is reached'}.`, {
      roles: [[temp, 'compare']],
      ptrs: [['temp', temp, 'compare']],
      vars: [...vars, ['count', n]],
    });
    for (;;) {
      const was: LNode = temp;
      elements.push(was.data);
      output.items.push({ text: String(was.data) });
      seen.push([was, 'done']);
      temp = was.next as LNode;
      n++;
      const back = temp === head;
      const capped = limit !== undefined && n >= limit;
      snap(
        back || capped ? 30 : 29,
        `elements.append(${was.data}), temp = temp.next (${temp.data}), count = ${n}.${
          back ? ' temp is the head again: one full lap, so stop.' : capped ? ` count reached the limit ${limit}: stop.` : ''
        }`,
        { roles: [...seen, [temp, back ? 'done' : 'compare']], links: [[was, 'next', 'compare']], ptrs: [['temp', temp, 'compare']], vars: [...vars, ['count', n]] },
      );
      if (back || capped) break;
    }
    snap(31, `return [${elements.join(', ')}].`, { roles: seen, vars: [...vars, ['count', n]] });
    return elements;
  };

  const KIND_NAME: Record<ListKind, string> = { singly: 'singly linked list', doubly: 'doubly linked list', circular: 'circular linked list' };
  snap(undefined, `An empty ${KIND_NAME[kind]}: self.head = None. Each operation below runs the repository's Python method step by step.`);

  ops.forEach((op, i) => {
    current = i;
    ghost = null;
    output = null;
    const vars: Array<[string, string | number]> = [['op', formatListOp(kind, op)]];
    let result: ListStep['result'] = null;
    if (kind === 'singly') {
      if (op.kind === 'head') singlyHead(op.value, vars);
      else if (op.kind === 'tail') singlyTail(op.value, vars);
      else if (op.kind === 'delete') singlyDelete(op.value, vars);
      else result = singlyDisplay(vars);
    } else if (kind === 'doubly') {
      if (op.kind === 'head') doublyHead(op.value, vars);
      else if (op.kind === 'tail') doublyTail(op.value, vars);
      else if (op.kind === 'delete') result = doublyDelete(op.value, vars);
      else if (op.kind === 'backward') result = doublyBackward(vars);
      else result = doublyForward(vars);
    } else if (op.kind === 'head' || op.kind === 'tail') circularInsert(op.value, op.kind === 'head', vars);
    else if (op.kind === 'delete') circularDelete(op.value, vars);
    else result = circularTraverse(op.kind === 'traverse' ? op.limit : undefined, vars);

    const fwd = forward();
    const step: ListStep = { op, values: fwd.map((n) => n.data), result };
    if (kind === 'doubly') {
      const back: number[] = [];
      for (let x = fwd.length ? fwd[fwd.length - 1] : null; x && back.length <= 1000; x = x.prev) back.push(x.data);
      step.backward = back;
    }
    if (kind === 'circular') step.closed = head === null || (fwd.length > 0 && fwd[fwd.length - 1].next === head);
    steps.push(step);
  });

  current = ops.length;
  ghost = null;
  output = null;
  const cost: Record<ListKind, string> = {
    singly: 'insert_at_head is O(1); insert_at_tail, delete and display walk the list, O(n).',
    doubly: 'insert_at_head is O(1); the tail insert, delete_value and the traversals walk the list, O(n).',
    circular: 'with only a head pointer every insert walks to the tail, so all operations here are O(n).',
  };
  snap(undefined, `Done: ${listText()}. Cost in this code: ${cost[kind]}`);
  return { frames, steps };
}
