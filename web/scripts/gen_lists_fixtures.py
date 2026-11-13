"""Generate golden fixtures for the array and linked-list visualizations from the repository's Python code.

The web visualizer re-implements the dynamic array, the singly, doubly and circular linked
lists and the skip list in TypeScript (web/src/viz/algorithms/dynamicArray.ts, linkedList.ts
and skipList.ts). These fixtures pin each port to its reference in Data_Structures/Linear:

- DynamicArray (Array/Python/dynamic_array.py): length, capacity and every slot of the backing
  list after each append / pop / a[k], with the value returned or the IndexError raised. That
  pins the doubling, the shrink at a quarter full and the cleared slots.
- SinglyLinkedList, DoublyLinkedList, CircularLinkedList (Linked_List/*/Python): the values
  after every operation (the doubly list also walked backward through its prev links, the
  circular one checked to close its ring) and what each method returns or prints.
- SkipList (Linked_List/Skip_List/Python/skip_list.py): the module's random.random() is replaced
  by mulberry32(seed), the seeded generator the visualization uses, so both build the same
  towers; an operation can also fix a level by replacing the object's _random_level. Each step
  records the keys on every level, the list's level, how many numbers were drawn, and the node
  keys the search key was compared with, in order, which pins the search path.

Run from anywhere:

    python3 web/scripts/gen_lists_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/lists.json. CI regenerates the file and fails
if it changed, which means the two implementations drifted.
"""

import io
import json
import random
import sys
from contextlib import redirect_stdout
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LINEAR = ROOT / "Data_Structures" / "Linear"
sys.path.insert(0, str(LINEAR / "Array" / "Python"))
for folder in ("Singly", "Doubly", "Circular", "Skip_List"):
    sys.path.insert(0, str(LINEAR / "Linked_List" / folder / "Python"))

import skip_list as skip_module  # noqa: E402
from circular_linked_list import CircularLinkedList  # noqa: E402
from doubly_linked_list import DoublyLinkedList  # noqa: E402
from dynamic_array import DynamicArray  # noqa: E402
from singly_linked_list import SinglyLinkedList  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "lists.json"


# ---- dynamic array ----


def dynamic_array_run(ops):
    arr = DynamicArray()
    steps = []
    for op in ops:
        result = None
        error = None
        try:
            if op[0] == "append":
                arr.append(op[1])
            elif op[0] == "pop":
                result = arr.pop()
            else:
                result = arr[op[1]]
        except IndexError as e:
            error = "IndexError: %s" % e
        steps.append({"n": len(arr), "capacity": arr._capacity, "slots": list(arr._A), "result": result, "error": error})
    return {"ops": ops, "steps": steps}


def dynamic_array_cases(rng, count):
    fixed = [
        [["append", v] for v in (10, 20, 30, 40, 50, 60, 70, 80, 90)] + [["pop"]] * 6,
        [["pop"], ["get", 0], ["append", 1], ["get", 0], ["get", 1], ["get", -1]],
        [["append", v] for v in range(16)] + [["pop"]] * 12 + [["get", 3], ["get", 4]],
        [["append", 1], ["append", 2], ["append", 3], ["pop"], ["append", 4], ["pop"], ["append", 5]],
        [["append", 5], ["pop"], ["pop"], ["append", 9], ["get", 0]],
    ]
    cases = [dynamic_array_run(ops) for ops in fixed]
    while len(cases) < count:
        ops = []
        n = 0
        for _ in range(rng.randint(1, 18)):
            r = rng.random()
            if r < 0.55 and n < 16:
                ops.append(["append", rng.randint(-99, 999)])
                n += 1
            elif r < 0.85:
                ops.append(["pop"])
                n = max(0, n - 1)
            else:
                ops.append(["get", rng.randint(-2, n + 2)])
        cases.append(dynamic_array_run(ops))
    return cases


# ---- singly, doubly, circular linked lists ----


def walk_next(head, stop_at_head=False):
    out = []
    node = head
    while node is not None:
        out.append(node.data)
        node = node.next
        if stop_at_head and node is head:
            break
        if len(out) > 1000:
            raise RuntimeError("runaway walk")
    return out


def walk_prev_from_last(head):
    node = head
    while node is not None and node.next is not None:
        node = node.next
    out = []
    while node is not None:
        out.append(node.data)
        node = node.prev
    return out


def printed(call):
    buf = io.StringIO()
    with redirect_stdout(buf):
        call()
    return buf.getvalue().rstrip("\n")


def list_run(kind, ops):
    lst = {"singly": SinglyLinkedList, "doubly": DoublyLinkedList, "circular": CircularLinkedList}[kind]()
    steps = []
    for op in ops:
        name = op[0]
        result = None
        if name == "head":
            lst.insert_at_head(op[1])
        elif name == "tail":
            lst.insert_at_tail(op[1])
        elif name == "delete":
            if kind == "singly":
                lst.delete(op[1])
            else:
                result = lst.delete_value(op[1])
                if kind == "circular":
                    assert result is None
        elif name == "backward":
            result = printed(lst.traverse_backward)
        elif kind == "singly":
            result = lst.display()
        elif kind == "doubly":
            result = printed(lst.traverse_forward)
        else:
            result = lst.traverse(op[1]) if len(op) > 1 else lst.traverse()
        step = {}
        if kind == "circular":
            values = lst.traverse()
            node = lst.head
            for _ in range(len(values)):
                node = node.next
            step["values"] = values
            step["closed"] = lst.head is None or node is lst.head
        else:
            step["values"] = walk_next(lst.head)
            if kind == "singly":
                assert step["values"] == lst.display()
            else:
                step["backward"] = walk_prev_from_last(lst.head)
        step["result"] = result
        steps.append(step)
    return {"ops": ops, "steps": steps}


LIST_FIXED = {
    "singly": [
        [["head", 1], ["head", 2], ["head", 3], ["tail", 4], ["delete", 3], ["traverse"]],
        [["tail", 1], ["tail", 2], ["tail", 3], ["tail", 4], ["delete", 1], ["delete", 3], ["delete", 4], ["traverse"]],
        [["head", 42], ["delete", 42], ["tail", 7], ["traverse"]],
        [["tail", 5], ["tail", 5], ["tail", 6], ["delete", 9], ["delete", 5], ["traverse"]],
        [["delete", 1], ["traverse"]],
    ],
    "doubly": [
        [["head", 1], ["head", 2], ["head", 3], ["tail", 4], ["delete", 3], ["traverse"], ["backward"]],
        [["head", 10], ["tail", 20], ["tail", 30], ["head", 5], ["traverse"], ["backward"]],
        [["tail", 1], ["tail", 2], ["tail", 3], ["tail", 4], ["delete", 2], ["delete", 1], ["delete", 4], ["backward"]],
        [["head", 5], ["delete", 9], ["delete", 5], ["delete", 5], ["traverse"], ["backward"]],
        [["tail", 7], ["tail", 7], ["tail", 8], ["delete", 7], ["traverse"], ["backward"]],
    ],
    "circular": [
        [["head", 1], ["head", 2], ["head", 3], ["tail", 4], ["delete", 3], ["traverse"]],
        [["head", 42], ["delete", 42], ["tail", 7], ["traverse"]],
        [["tail", 1], ["tail", 2], ["tail", 3], ["tail", 4], ["delete", 1], ["delete", 3], ["delete", 4], ["traverse"]],
        [["tail", 1], ["tail", 2], ["tail", 3], ["delete", 9], ["traverse"]],
        [["head", 10], ["head", 20], ["tail", 30], ["traverse", 2], ["traverse"]],
        [["delete", 1], ["traverse"], ["head", 5], ["delete", 9], ["traverse", 1]],
    ],
}


def list_cases(rng, kind, count):
    cases = [list_run(kind, ops) for ops in LIST_FIXED[kind]]
    while len(cases) < count:
        ops = []
        size = 0
        for _ in range(rng.randint(1, 12)):
            r = rng.random()
            v = rng.randrange(6)
            if r < 0.28 and size < 10:
                ops.append(["head", v])
                size += 1
            elif r < 0.56 and size < 10:
                ops.append(["tail", v])
                size += 1
            elif r < 0.84:
                ops.append(["delete", v])
                size = max(0, size - 1)
            elif kind == "doubly" and r < 0.92:
                ops.append(["backward"])
            elif kind == "circular" and r < 0.92:
                ops.append(["traverse", rng.randint(1, 5)])
            else:
                ops.append(["traverse"])
        cases.append(list_run(kind, ops))
    return cases


# ---- skip list ----


def mulberry32(seed):
    """The visualization's seeded generator (skipList.ts), bit for bit: floats in [0, 1)."""
    state = seed & 0xFFFFFFFF

    def draw():
        nonlocal state
        state = (state + 0x6D2B79F5) & 0xFFFFFFFF
        a = state
        t = ((a ^ (a >> 15)) * (1 | a)) & 0xFFFFFFFF
        t = ((t + (((t ^ (t >> 7)) * (61 | t)) & 0xFFFFFFFF)) & 0xFFFFFFFF) ^ t
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296

    return draw


class Draws:
    """Stands in for the random module inside skip_list.py and counts the calls."""

    def __init__(self, seed):
        self.next = mulberry32(seed)
        self.count = 0

    def random(self):
        self.count += 1
        return self.next()


class Probe:
    """A key that logs every node key it is compared with, in order.

    `node.key < key` reaches __gt__ (int.__lt__ returns NotImplemented, so Python reflects it);
    `node.key == key` and `node.key != key` reach __eq__ / __ne__.
    """

    __hash__ = None

    def __init__(self, value, log):
        self.value = value
        self.log = log

    def __gt__(self, other):
        self.log["lt"].append(other)
        return self.value > other

    def __eq__(self, other):
        self.log["eq"].append(other)
        return self.value == other

    def __ne__(self, other):
        self.log["eq"].append(other)
        return self.value != other


def skip_levels(sl):
    rows = []
    for i in range(sl.max_level + 1):
        row, node = [], sl.header.forward[i]
        while node is not None:
            row.append(node.key)
            node = node.forward[i]
        rows.append(row)
    assert all(not row for row in rows[sl.level + 1:]), "a level above sl.level holds keys"
    return rows[: sl.level + 1]


def skip_run(seed, p, max_level, ops):
    sl = skip_module.SkipList(max_level=max_level, p=p)
    draws = Draws(seed)
    skip_module.random = draws
    steps = []
    try:
        for op in ops:
            log = {"lt": [], "eq": []}
            key = Probe(op[1], log)
            before = len(sl.display())
            draws.count = 0
            if op[0] == "insert":
                if len(op) > 2:
                    sl._random_level = lambda level=op[2]: level
                try:
                    result = sl.insert(key)
                finally:
                    sl.__dict__.pop("_random_level", None)
                node = sl.header.forward[0]
                height = None
                while node is not None:
                    if isinstance(node.key, Probe):
                        node.key = node.key.value
                        height = len(node.forward) - 1
                    node = node.forward[0]
                assert (height is not None) == (len(sl.display()) == before + 1)
            elif op[0] == "search":
                result = sl.search(key)
                height = None
            else:
                result = sl.delete(key)
                height = None
            assert len(log["eq"]) <= 1
            steps.append(
                {
                    "result": result,
                    "level": sl.level,
                    "levels": skip_levels(sl),
                    "lt": log["lt"],
                    "eq": log["eq"][0] if log["eq"] else None,
                    "draws": draws.count,
                    "height": height,
                }
            )
    finally:
        skip_module.random = random
    return {"seed": seed, "p": p, "max_level": max_level, "ops": ops, "steps": steps}


SKIP_FIXED = [
    # The article's six keys with fixed towers, then search 19, insert 15, delete 6 and 25.
    (1, 0.5, 16, [["insert", 3, 1], ["insert", 6, 2], ["insert", 9, 0], ["insert", 12, 1], ["insert", 19, 0], ["insert", 25, 3],
                  ["search", 19], ["insert", 15, 1], ["delete", 6], ["delete", 25], ["search", 25]]),
    (7, 0.5, 16, [["insert", 3], ["insert", 6], ["search", 6], ["insert", 9], ["insert", 12], ["search", 10], ["delete", 3]]),
    (3, 0.5, 16, [["insert", 5], ["insert", 5], ["search", 4], ["delete", 10], ["delete", 5], ["search", 5]]),
    (1, 0.5, 1, [["insert", v] for v in (1, 2, 3, 4, 5, 6)] + [["search", 6]]),
    (5, 0.5, 0, [["insert", v] for v in (4, 2, 6)] + [["search", 6], ["delete", 2]]),
    (11, 0.75, 16, [["insert", v] for v in (8, 3, 5, 1)] + [["delete", 8], ["delete", 5], ["search", 3]]),
    (2, 0.25, 3, [["insert", -1], ["insert", -5], ["insert", 0], ["search", -1], ["delete", -1], ["search", -1]]),
]


def skip_cases(rng, count):
    cases = [skip_run(seed, p, max_level, ops) for seed, p, max_level, ops in SKIP_FIXED]
    while len(cases) < count:
        seed = rng.randrange(2 ** 32)
        p = rng.choice([0.5, 0.5, 0.25, 0.75])
        max_level = rng.choice([16, 16, 16, 3, 2, 1, 0])
        present = set()
        ops = []
        for _ in range(rng.randint(1, 14)):
            key = rng.randint(-5, 15)
            r = rng.random()
            if r < 0.5 and len(present) < 10:
                if rng.random() < 0.15:
                    ops.append(["insert", key, rng.randint(0, min(max_level, 3))])
                else:
                    ops.append(["insert", key])
                present.add(key)
            elif r < 0.75:
                ops.append(["search", key])
            else:
                ops.append(["delete", key])
                present.discard(key)
        cases.append(skip_run(seed, p, max_level, ops))
    return cases


def main():
    rng = random.Random(20261113)
    sections = {
        "dynamic_array": dynamic_array_cases(rng, 50),
        "singly": list_cases(rng, "singly", 60),
        "doubly": list_cases(rng, "doubly", 60),
        "circular": list_cases(rng, "circular", 60),
        "skip_list": skip_cases(rng, 70),
    }
    header = {
        "generator": "web/scripts/gen_lists_fixtures.py",
        "reference": "Data_Structures/Linear/Array (dynamic_array.py); Data_Structures/Linear/Linked_List (singly_linked_list.py, doubly_linked_list.py, circular_linked_list.py, skip_list.py)",
    }
    parts = []
    for key, cases in sections.items():
        lines = [json.dumps(c, separators=(",", ":")) for c in cases]
        parts.append(json.dumps(key) + ": [\n" + ",\n".join(lines) + "\n]")
    body = json.dumps(header)[:-1] + ",\n" + ",\n".join(parts) + "\n}\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="ascii")
    counts = ", ".join("%d %s" % (len(c), k) for k, c in sections.items())
    print("wrote %s cases to %s" % (counts, OUT.relative_to(ROOT)))


if __name__ == "__main__":
    main()
