"""Generate golden fixtures for the binary-tree visualizations from the repository's Python code.

The web visualizer re-implements six trees of Data_Structures/Non_Linear/Trees in TypeScript
(web/src/viz/algorithms/binaryTree.ts, redBlackTree.ts, splayTree.ts, treap.ts,
cartesianTree.ts and intervalTree.ts). These fixtures run the Python classes on fixed and
random operation scripts and record, after every operation, the return value and the whole
tree, so the ports cannot drift:

- BinaryTree: the tree as nested [data, left, right] (level-order insert, duplicates) and the
  result of search, every traversal, height (in edges) and size.
- RedBlackTree: the tree as nested [data, colour, left, right], the result of search,
  find_min and find_max, height() (which counts nodes) and size(), and every rotation the
  insert fix-up made ("L 10" = _left_rotate at 10), which pins the fix-up cases.
- SplayTree: the tree, the result of every operation, whether a search hit, and every rotation,
  which pins each zig, zig-zig and zig-zag, the splay of the last node on a miss and the
  split-and-join delete.
- Treap: the module's random.random() is replaced by mulberry32(seed), the seeded generator
  the visualization uses (web/src/viz/algorithms/skipList.ts), and an insert can fix its
  priority instead of drawing one. Each step records the tree as nested [key, priority, left,
  right], the result and how many numbers were drawn. The priorities are k / 2**32, exact in
  binary, so the file is the same on every platform.
- CartesianTree: the tree as nested [value, index, left, right], the in-order traversal and
  every get_min_index result.
- IntervalTree: the tree as nested [low, high, max, left, right] after every operation, every
  query result in the order Python appends it, and every ValueError.

Run from anywhere:

    python3 web/scripts/gen_binaryTrees_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/binaryTrees.json. CI regenerates the file and
fails if it changed, which means the implementations drifted.
"""

import importlib.util
import json
import random
import sys
from pathlib import Path

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[2]
TREES = ROOT / "Data_Structures" / "Non_Linear" / "Trees"
OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "binaryTrees.json"
RNG = random.Random(20261114)


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


binary_tree = load("binary_tree", TREES / "Binary_Tree" / "Python" / "binary_tree.py")
red_black_tree = load("red_black_tree", TREES / "Red_Black_Tree" / "Python" / "red_black_tree.py")
splay_tree = load("splay_tree", TREES / "Splay_Tree" / "Python" / "splay_tree.py")
treap_module = load("treap", TREES / "Treap" / "Python" / "treap.py")
cartesian_tree = load("cartesian_tree", TREES / "Cartesian_Tree" / "Python" / "cartesian_tree.py")
interval_tree = load("interval_tree", TREES / "Interval_Tree" / "Python" / "interval_tree.py")


# ---------- binary tree ----------


def bt_nested(node):
    return None if node is None else [node.data, bt_nested(node.left), bt_nested(node.right)]


def binary_tree_case(ops):
    tree = binary_tree.BinaryTree()
    calls = {
        "search": tree.search,
        "inorder": tree.inorder_traversal,
        "preorder": tree.preorder_traversal,
        "postorder": tree.postorder_traversal,
        "level": tree.level_order_traversal,
        "height": tree.height,
        "size": tree.size,
    }
    steps = []
    for op in ops:
        if op[0] == "insert":
            result = tree.insert(op[1])
        elif op[0] == "search":
            result = tree.search(op[1])
        else:
            result = calls[op[0]]()
        steps.append({"result": result, "tree": bt_nested(tree.root)})
    return {"ops": ops, "steps": steps}


BT_FIXED = [
    [["insert", v] for v in range(1, 8)] + [["inorder"], ["preorder"], ["postorder"], ["level"], ["height"], ["size"]],
    [["insert", v] for v in (1, 2, 3, 4, 5)] + [["insert", 6], ["search", 6], ["search", 9]],
    [["inorder"], ["level"], ["height"], ["size"], ["search", 1], ["insert", 4], ["height"], ["inorder"]],
    [["insert", 7], ["insert", 7], ["insert", 3], ["search", 3], ["postorder"], ["height"]],
]


def binary_tree_cases(count):
    cases = [binary_tree_case(ops) for ops in BT_FIXED]
    kinds = ["search", "inorder", "preorder", "postorder", "level", "height", "size"]
    while len(cases) < count:
        ops, inserts = [], 0
        for _ in range(RNG.randint(1, 24)):
            if inserts < 15 and RNG.random() < 0.55:
                ops.append(["insert", RNG.randint(0, 30)])
                inserts += 1
            else:
                kind = RNG.choice(kinds)
                ops.append([kind, RNG.randint(0, 30)] if kind == "search" else [kind])
        cases.append(binary_tree_case(ops))
    return cases


# ---------- red-black tree ----------


def rb_nested(tree, node):
    if node == tree.NIL:
        return None
    colour = "R" if node.color == red_black_tree.Color.RED else "B"
    return [node.data, colour, rb_nested(tree, node.left), rb_nested(tree, node.right)]


def logging_rotations(tree, log, key):
    """Wrap the instance's rotations so each call is recorded with the key of the node it rotates at."""
    left, right = tree._left_rotate, tree._right_rotate

    def left_rotate(x):
        log.append(f"L {getattr(x, key)}")
        left(x)

    def right_rotate(x):
        log.append(f"R {getattr(x, key)}")
        right(x)

    tree._left_rotate = left_rotate
    tree._right_rotate = right_rotate


def red_black_case(ops):
    tree = red_black_tree.RedBlackTree()
    log = []
    logging_rotations(tree, log, "data")
    steps = []
    for op in ops:
        log.clear()
        if op[0] == "insert":
            result = tree.insert(op[1])
        elif op[0] == "search":
            result = tree.search(op[1])
        elif op[0] == "min":
            result = tree.find_min()
        else:
            result = tree.find_max()
        steps.append({"result": result, "tree": rb_nested(tree, tree.root), "rotations": list(log), "height": tree.height(), "size": tree.size()})
    return {"ops": ops, "steps": steps}


RB_FIXED = [
    [["insert", k] for k in (10, 20, 30, 40, 50, 25)] + [["search", 25], ["search", 35], ["min"], ["max"]],
    [["insert", k] for k in (30, 10, 20)],
    [["insert", k] for k in (10, 30, 20)],
    [["insert", k] for k in range(1, 16)],
    [["insert", k] for k in range(15, 0, -1)],
    [["min"], ["max"], ["search", 5], ["insert", 5], ["insert", 5], ["insert", 5], ["insert", 5], ["search", 5], ["min"]],
    [["insert", k] for k in (41, 38, 31, 12, 19, 8)],
]


def red_black_cases(count):
    cases = [red_black_case(ops) for ops in RB_FIXED]
    while len(cases) < count:
        ops, inserts = [], 0
        hi = RNG.choice([10, 30, 99])
        for _ in range(RNG.randint(1, 26)):
            r = RNG.random()
            if inserts < 15 and r < 0.7:
                ops.append(["insert", RNG.randint(0, hi)])
                inserts += 1
            elif r < 0.9:
                ops.append(["search", RNG.randint(0, hi)])
            else:
                ops.append([RNG.choice(["min", "max"])])
        cases.append(red_black_case(ops))
    return cases


# ---------- splay tree ----------


def splay_nested(node):
    return None if node is None else [node.key, splay_nested(node.left), splay_nested(node.right)]


def splay_case(ops):
    tree = splay_tree.SplayTree()
    log = []
    logging_rotations(tree, log, "key")
    steps = []
    for op in ops:
        log.clear()
        step = {}
        if op[0] == "insert":
            result = tree.insert(op[1])
        elif op[0] == "search":
            result = tree.search(op[1])
            step["found"] = tree.root is not None and tree.root.key == op[1]
        elif op[0] == "delete":
            result = tree.delete(op[1])
        elif op[0] == "min":
            result = tree.find_min()
        else:
            result = tree.find_max()
        step.update({"result": result, "tree": splay_nested(tree.root), "rotations": list(log)})
        steps.append(step)
    return {"ops": ops, "steps": steps}


SPLAY_FIXED = [
    [["insert", k] for k in (50, 30, 70, 20, 40)] + [["search", 20], ["delete", 20]],
    [["insert", k] for k in (1, 2, 3)] + [["search", 1]],
    [["insert", k] for k in (3, 1, 2)],
    [["insert", k] for k in range(1, 9)] + [["search", 1], ["search", 4]],
    [["insert", k] for k in (1, 3, 2)] + [["delete", 2], ["search", 3]],
    [["insert", k] for k in (10, 20, 30)] + [["search", 25], ["delete", 5], ["delete", 30], ["min"], ["max"], ["delete", 10], ["delete", 20], ["search", 1], ["min"]],
    [["insert", 5], ["insert", 5], ["delete", 5], ["delete", 5]],
]


def splay_cases(count):
    cases = [splay_case(ops) for ops in SPLAY_FIXED]
    while len(cases) < count:
        ops, live = [], set()
        for _ in range(RNG.randint(1, 26)):
            key = RNG.randint(0, 20)
            r = RNG.random()
            if r < 0.45 and (key in live or len(live) < 10):
                ops.append(["insert", key])
                live.add(key)
            elif r < 0.65:
                ops.append(["search", key])
            elif r < 0.9:
                ops.append(["delete", key])
                live.discard(key)
            else:
                ops.append([RNG.choice(["min", "max"])])
        cases.append(splay_case(ops))
    return cases


# ---------- treap ----------


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
    """Stands in for the random module inside treap.py: mulberry32 draws, or a priority the script fixed."""

    def __init__(self, seed):
        self.next = mulberry32(seed)
        self.count = 0
        self.fixed = None

    def random(self):
        if self.fixed is not None:
            value, self.fixed = self.fixed, None
            return value
        self.count += 1
        return self.next()


def treap_nested(node):
    return None if node is None else [node.key, node.priority, treap_nested(node.left), treap_nested(node.right)]


def treap_case(seed, ops):
    draws = Draws(seed)
    treap_module.random = draws
    try:
        t = treap_module.Treap()
        steps = []
        for op in ops:
            before = draws.count
            if op[0] == "insert":
                draws.fixed = op[2] if len(op) > 2 else None
                result = t.insert(op[1])
                draws.fixed = None
            elif op[0] == "delete":
                result = t.delete(op[1])
            else:
                result = op[1] in t
            assert t.check_heap_property()
            steps.append({"result": result, "tree": treap_nested(t._root), "draws": draws.count - before, "size": len(t)})
    finally:
        treap_module.random = random
    return {"seed": seed, "ops": ops, "steps": steps}


TREAP_FIXED = [
    (1, [["insert", 5, 0.9], ["insert", 2, 0.6], ["insert", 8, 0.4], ["insert", 6, 0.7], ["delete", 5]]),
    (7, [["insert", k] for k in (5, 3, 7, 1, 9, 4, 6, 2, 8)] + [["delete", 5], ["search", 5], ["search", 6]]),
    (1, [["insert", 4, 0.5], ["insert", 2, 0.5], ["insert", 6, 0.5], ["delete", 4]]),
    (3, [["insert", 1], ["insert", 1], ["delete", 2], ["delete", 1], ["delete", 1], ["search", 1]]),
    (3, [["insert", 1], ["insert", 1], ["insert", 999], ["delete", 2], ["delete", 999], ["search", 999]]),
    (42, [["insert", k] for k in range(1, 11)] + [["delete", 1], ["delete", 10]]),
]


def treap_cases(count):
    cases = [treap_case(seed, ops) for seed, ops in TREAP_FIXED]
    while len(cases) < count:
        seed = RNG.randint(0, 2**32 - 1)
        ops, live = [], set()
        for _ in range(RNG.randint(1, 22)):
            key = RNG.randint(0, 25)
            r = RNG.random()
            if r < 0.55 and (key in live or len(live) < 12):
                if RNG.random() < 0.15:
                    ops.append(["insert", key, RNG.choice([0.5, 0.25, 0.75, 0.9, 0.1])])
                else:
                    ops.append(["insert", key])
                live.add(key)
            elif r < 0.8:
                ops.append(["delete", key])
                live.discard(key)
            else:
                ops.append(["search", key])
        cases.append(treap_case(seed, ops))
    return cases


# ---------- Cartesian tree ----------


def cart_nested(node):
    return None if node is None else [node.value, node.index, cart_nested(node.left), cart_nested(node.right)]


def cartesian_case(array, queries):
    tree = cartesian_tree.CartesianTree(array)
    return {
        "array": array,
        "queries": queries,
        "tree": cart_nested(tree.root),
        "inorder": tree.inorder_traversal(),
        "height": tree.height(),
        "results": [tree.get_min_index(l, r) for l, r in queries],
    }


CART_FIXED = [
    ([9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5], [[4, 8], [0, 2], [5, 9], [6, 10], [0, 10], [3, 3]]),
    ([1, 2, 3, 4, 5, 6], [[2, 5], [0, 0]]),
    ([6, 5, 4, 3, 2, 1], [[0, 3], [2, 5]]),
    ([4, 2, 4, 2, 4], [[0, 4], [2, 4], [1, 1]]),
    ([], [[0, 0]]),
    ([3, 1, 2], [[-1, 2], [0, 3], [2, 1]]),
]


def cartesian_cases(count):
    cases = [cartesian_case(a, q) for a, q in CART_FIXED]
    while len(cases) < count:
        n = RNG.randint(0, 12)
        hi = RNG.choice([3, 9, 50, 999])
        array = [RNG.randint(-20 if hi > 9 else 0, hi) for _ in range(n)]
        queries = []
        for _ in range(RNG.randint(0, 10)):
            if n and RNG.random() < 0.85:
                left = RNG.randint(0, n - 1)
                queries.append([left, RNG.randint(left, n - 1)])
            else:
                queries.append([RNG.randint(-2, n + 1), RNG.randint(-2, n + 1)])
        cases.append(cartesian_case(array, queries))
    return cases


# ---------- interval tree ----------


def iv_nested(node):
    if node is None:
        return None
    return [node.interval.low, node.interval.high, node.max, iv_nested(node.left), iv_nested(node.right)]


def interval_case(ops):
    tree = interval_tree.IntervalTree()
    steps = []
    for op in ops:
        result, error = None, None
        try:
            if op[0] == "insert":
                tree.insert((op[1], op[2]))
            elif op[0] == "delete":
                tree.delete((op[1], op[2]))
            elif op[0] == "overlap":
                result = [[i.low, i.high] for i in tree.search_overlapping((op[1], op[2]))]
            elif op[0] == "contained":
                result = [[i.low, i.high] for i in tree.search_contained_in((op[1], op[2]))]
            else:
                result = [[i.low, i.high] for i in tree.search_containing_point(op[1])]
        except ValueError:
            error = "ValueError"
        steps.append({"result": result, "error": error, "tree": iv_nested(tree.root)})
    return {"ops": ops, "steps": steps}


IV_FIXED = [
    [["insert", 15, 20], ["insert", 10, 30], ["insert", 17, 19], ["insert", 5, 20], ["insert", 12, 15], ["insert", 30, 40],
     ["overlap", 22, 26], ["overlap", 14, 16], ["point", 18], ["contained", 4, 25], ["delete", 10, 30], ["overlap", 22, 26]],
    [["insert", 1, 5], ["insert", 5, 9], ["overlap", 5, 5], ["point", 9], ["insert", 9, 3], ["overlap", 6, 2], ["delete", 7, 1]],
    [["insert", 5, 20], ["insert", 5, 10], ["insert", 5, 20], ["delete", 5, 20], ["overlap", 0, 99], ["delete", 5, 20], ["delete", 5, 20]],
    [["insert", k, k + 1] for k in range(8)] + [["overlap", 3, 4], ["delete", 0, 1], ["delete", 3, 4]],
]


def interval_cases(count):
    cases = [interval_case(ops) for ops in IV_FIXED]
    while len(cases) < count:
        ops, live = [], []
        for _ in range(RNG.randint(1, 22)):
            lo = RNG.randint(0, 40)
            hi = lo + RNG.randint(-3, 25)
            hi = max(0, min(99, hi))
            r = RNG.random()
            if r < 0.45 and len(live) < 10:
                ops.append(["insert", lo, hi])
                if lo <= hi:
                    live.append((lo, hi))
            elif r < 0.6 and live:
                lo2, hi2 = RNG.choice(live)
                ops.append(["delete", lo2, hi2])
                live.remove((lo2, hi2))
            elif r < 0.65:
                ops.append(["delete", lo, hi])
                if (lo, hi) in live:
                    live.remove((lo, hi))
            elif r < 0.82:
                ops.append(["overlap", lo, hi])
            elif r < 0.92:
                ops.append(["contained", lo, hi])
            else:
                ops.append(["point", lo])
        cases.append(interval_case(ops))
    return cases


def main():
    sections = {
        "binaryTree": binary_tree_cases(40),
        "redBlack": red_black_cases(45),
        "splay": splay_cases(50),
        "treap": treap_cases(45),
        "cartesian": cartesian_cases(50),
        "interval": interval_cases(50),
    }
    header = {
        "generator": "web/scripts/gen_binaryTrees_fixtures.py",
        "reference": "Data_Structures/Non_Linear/Trees (binary_tree.py, red_black_tree.py, splay_tree.py, treap.py, cartesian_tree.py, interval_tree.py)",
    }
    parts = []
    for key, cases in sections.items():
        lines = [json.dumps(c, separators=(",", ":")) for c in cases]
        parts.append(json.dumps(key) + ": [\n" + ",\n".join(lines) + "\n]")
    body = json.dumps(header)[:-1] + ",\n" + ",\n".join(parts) + "\n}\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="ascii")
    counts = ", ".join(f"{len(c)} {k}" for k, c in sections.items())
    print(f"wrote {counts} cases to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
