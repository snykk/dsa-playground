"""Generate golden multiway-tree fixtures from the repository's Python implementations.

The web visualizer re-implements four trees in TypeScript (web/src/viz/algorithms/): the
B-tree (bTree.ts), the B+ tree (bPlusTree.ts), the trie (trie.ts) and the suffix tree
(suffixTree.ts). These fixtures pin each port to its reference in
Data_Structures/Non_Linear/Trees:

- bTree: the tree after every insert, delete and search, every search result (the keys of
  the node and the index Python returns), and every split median, borrow, merge,
  predecessor and successor, in order;
- bPlusTree: the tree and the leaf chain (followed through `next`) after every operation,
  the result of every search, range_search and traverse, and every split with the key it
  copied up (leaf) or pushed up (internal node);
- trie: the trie (children in dict order, end-of-word flags) and the result of every
  insert, search, starts_with, delete and get_all_words;
- suffixTree: the tree after each suffix is inserted, every edge split
  (split_pos, text_pos, suffix), and the result of every search.

Run from anywhere:

    python3 web/scripts/gen_multiwayTrees_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/multiwayTrees.json. CI regenerates the file
and fails if it changed, which means the two implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

sys.dont_write_bytecode = True

ROOT = Path(__file__).resolve().parents[2]
TREES = ROOT / "Data_Structures" / "Non_Linear" / "Trees"
for folder in ("B_Tree/Python", "B_Plus_Tree/Python", "Trie/Python", "Suffix_Tree/Python"):
    sys.path.insert(0, str(TREES / folder))

from b_plus_tree import BPlusTree  # noqa: E402
from b_tree import BTree  # noqa: E402
from suffix_tree import SuffixTree  # noqa: E402
from trie import Trie  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "multiwayTrees.json"
RNG = random.Random(20261114)

# The visualizer's limits (parseBTree, parseBPlusTree, parseTrie, parseSuffixTree).
MAX_OPS = 30
BTREE_MAX_KEYS = 24
BPLUS_MAX_KEYS = 24


# ---------- B-tree ----------


class TracedBTree(BTree):
    """BTree that logs the decisions the visualizer must reproduce; the logic is the parent's."""

    def __init__(self, min_degree):
        super().__init__(min_degree)
        self.events = []

    def _split_child(self, parent, index):
        self.events.append(["split", parent.children[index].keys[self.min_keys]])
        super()._split_child(parent, index)

    def _borrow_from_left(self, parent, index):
        self.events.append(["borrowLeft", parent.keys[index - 1]])
        super()._borrow_from_left(parent, index)

    def _borrow_from_right(self, parent, index):
        self.events.append(["borrowRight", parent.keys[index]])
        super()._borrow_from_right(parent, index)

    def _merge_children(self, parent, index):
        self.events.append(["merge", parent.keys[index]])
        super()._merge_children(parent, index)

    def _get_predecessor(self, node):
        value = super()._get_predecessor(node)
        self.events.append(["pred", value])
        return value

    def _get_successor(self, node):
        value = super()._get_successor(node)
        self.events.append(["succ", value])
        return value


def btree_dump(node):
    return [list(node.keys), [btree_dump(c) for c in node.children]]


def btree_case(t, ops):
    tree = TracedBTree(t)
    steps = []
    for kind, key in ops:
        tree.events = []
        result = None
        if kind == "insert":
            tree.insert(key)
        elif kind == "delete":
            tree.delete(key)
        else:
            found = tree.search(key)
            result = None if found is None else [list(found[0].keys), found[1]]
        steps.append({"result": result, "tree": btree_dump(tree.root), "events": tree.events})
    return {"t": t, "ops": [list(op) for op in ops], "steps": steps}


BTREE_FIXED = [
    # The article: 10..60 into t = 2, then the deletes of its walkthrough.
    (2, [("insert", k) for k in (10, 20, 30, 40, 50, 60)]),
    # This order builds the article's tree [20, 40] over [10], [25, 30, 35], [50, 60].
    (2, [("insert", k) for k in (10, 20, 25, 40, 50, 30, 35, 60)] + [("delete", 40), ("delete", 10), ("delete", 30), ("delete", 20)]),
    # Regressions fixed in v0.2.0: a middle child merging with its left sibling.
    (3, [("insert", k) for k in range(1, 13)] + [("delete", 4), ("search", 4)]),
    (2, [("insert", k) for k in (29, 9, 1, 27, 2, 23, 0, 25, 26, 10, 6, 18, 24, 21)] + [("delete", 24), ("search", 24)]),
    # Root split with the default degree, then a root merge that makes the tree shorter.
    (3, [("insert", k) for k in (10, 20, 30, 40, 50, 60)] + [("delete", 60), ("delete", 50), ("delete", 10), ("search", 30)]),
    # Duplicates: stored twice, deleted one copy at a time.
    (2, [("insert", 5), ("insert", 5), ("insert", 5), ("insert", 3), ("insert", 5), ("search", 5), ("delete", 5), ("delete", 5), ("search", 5)]),
    # Deleting a missing key, and deleting from an empty tree.
    (3, [("delete", 7), ("insert", 7), ("delete", 8), ("delete", 7), ("delete", 7), ("search", 7)]),
    # Case 2a / 2b / 2c on internal keys.
    (2, [("insert", k) for k in range(1, 16)] + [("delete", 8), ("delete", 4), ("delete", 12), ("delete", 2), ("delete", 6)]),
    (5, [("insert", k) for k in range(0, 24)] + [("delete", 9), ("delete", 4), ("search", 17)]),
]


def btree_random_ops(t):
    pool = RNG.sample(range(0, 100), RNG.randint(6, 30))
    ops = []
    live = []
    for _ in range(RNG.randint(5, MAX_OPS)):
        r = RNG.random()
        if r < 0.55 and len(live) < BTREE_MAX_KEYS:
            key = RNG.choice(pool)
            ops.append(("insert", key))
            live.append(key)
        elif r < 0.85:
            key = RNG.choice(live) if live and RNG.random() < 0.8 else RNG.choice(pool)
            ops.append(("delete", key))
            if key in live:
                live.remove(key)
        else:
            ops.append(("search", RNG.choice(pool)))
    return ops


def btree_cases(count):
    cases = [btree_case(t, ops) for t, ops in BTREE_FIXED]
    while len(cases) < count:
        t = RNG.choice([2, 2, 3, 3, 4, 5])
        cases.append(btree_case(t, btree_random_ops(t)))
    return cases


# ---------- B+ tree ----------


class TracedBPlusTree(BPlusTree):
    def __init__(self, min_degree):
        super().__init__(min_degree)
        self.events = []

    def _split_child(self, parent, index):
        child = parent.children[index]
        if child.is_leaf:
            self.events.append(["leafSplit", child.keys[self.min_keys]])
        else:
            self.events.append(["innerSplit", child.keys[self.min_keys]])
        super()._split_child(parent, index)


def bplus_dump(node):
    if node.is_leaf:
        return ["L", [[k, v] for k, v in zip(node.keys, node.values)]]
    return ["I", list(node.keys), [bplus_dump(c) for c in node.children]]


def bplus_chain(tree):
    leaf = tree.root
    while not leaf.is_leaf:
        leaf = leaf.children[0]
    out = []
    while leaf is not None:
        out.append(list(leaf.keys))
        leaf = leaf.next
    return out


def bplus_case(t, ops):
    tree = TracedBPlusTree(t)
    steps = []
    for op in ops:
        tree.events = []
        result = None
        if op[0] == "insert":
            tree.insert(op[1], op[2])
        elif op[0] == "search":
            result = tree.search(op[1])
        elif op[0] == "range":
            result = [[k, v] for k, v in tree.range_search(op[1], op[2])]
        else:
            result = [[k, v] for k, v in tree.traverse()]
        steps.append({"result": result, "tree": bplus_dump(tree.root), "chain": bplus_chain(tree), "events": tree.events})
    return {"t": t, "ops": [list(op) for op in ops], "steps": steps}


def letters(i):
    return "abcdefghijklmnopqrstuvwxyz"[i % 26]


def inserts(keys):
    return [("insert", k, letters(i)) for i, k in enumerate(keys)]


BPLUS_FIXED = [
    # The article: 1..8 with t = 3, then 10..90 with t = 2 and its range query.
    (3, inserts(range(1, 9)) + [("traverse",)]),
    (2, inserts(range(10, 100, 10)) + [("range", 25, 65), ("search", 50), ("search", 55)]),
    (2, inserts([20, 30, 40, 10, 50, 60, 70])),
    # Duplicates overwrite (v0.2.0 fix): the value changes, the shape does not.
    (2, inserts([5, 1, 9]) + [("insert", 5, "x"), ("insert", 5, "y"), ("search", 5), ("range", 5, 5), ("traverse",)]),
    # Empty tree and empty ranges.
    (3, [("search", 4), ("range", 1, 9), ("traverse",), ("insert", 4, "a"), ("range", 9, 1), ("range", 5, 8)]),
    # Default degree, sorted and reverse input.
    (3, inserts(range(24))),
    (3, inserts(range(23, -1, -1)) + [("range", 3, 17)]),
    (4, inserts([50, 10, 90, 30, 70, 20, 80, 40, 60, 0, 99, 55, 45, 35, 25, 15]) + [("range", 0, 99), ("search", 45)]),
]


def bplus_random_ops(t):
    pool = RNG.sample(range(0, 100), RNG.randint(8, 40))
    ops = []
    live = set()
    for i in range(RNG.randint(5, MAX_OPS)):
        r = RNG.random()
        key = RNG.choice(pool)
        if r < 0.65 and (key in live or len(live) < BPLUS_MAX_KEYS):
            ops.append(("insert", key, letters(i)))
            live.add(key)
        elif r < 0.8:
            ops.append(("search", key))
        elif r < 0.95:
            lo = RNG.randint(-5, 100)
            hi = lo + RNG.randint(-10, 50)
            ops.append(("range", max(0, lo), max(0, min(999, hi))))
        else:
            ops.append(("traverse",))
    return ops


def bplus_cases(count):
    cases = [bplus_case(t, ops) for t, ops in BPLUS_FIXED]
    while len(cases) < count:
        t = RNG.choice([2, 2, 3, 3, 4, 5])
        cases.append(bplus_case(t, bplus_random_ops(t)))
    return cases


# ---------- trie ----------


def trie_dump(node):
    return [node.is_end_of_word, [[ch, trie_dump(child)] for ch, child in node.children.items()]]


def trie_case(ops):
    trie = Trie()
    steps = []
    for op in ops:
        kind = op[0]
        if kind == "insert":
            result = trie.insert(op[1])
        elif kind == "search":
            result = trie.search(op[1])
        elif kind == "prefix":
            result = trie.starts_with(op[1])
        elif kind == "delete":
            result = trie.delete(op[1])
        else:
            result = trie.get_all_words()
        steps.append({"result": result, "trie": trie_dump(trie.root)})
    return {"ops": [list(op) for op in ops], "steps": steps}


TRIE_FIXED = [
    # The article's trie and its deletes.
    [("insert", w) for w in ("app", "apple", "apt", "bat", "bath")]
    + [("search", "app"), ("search", "ap"), ("prefix", "ap"), ("search", "bax"), ("words",), ("delete", "apple"), ("delete", "bath"), ("delete", "app"), ("words",)],
    # delete reports its result (v0.2.0 fix).
    [("insert", "apple"), ("insert", "app"), ("insert", "dog"), ("delete", "apple"), ("delete", "apple"), ("delete", "appl"), ("delete", "cat"), ("delete", "app"), ("delete", "dog"), ("words",)],
    # The empty word.
    [("insert", ""), ("search", ""), ("prefix", ""), ("words",), ("insert", "a"), ("delete", ""), ("search", ""), ("words",), ("delete", "a"), ("delete", "")],
    # Re-inserting after a prune changes the dict order.
    [("insert", "car"), ("insert", "cat"), ("insert", "cab"), ("delete", "car"), ("insert", "car"), ("words",), ("prefix", "ca"), ("prefix", "cb")],
]

WORDS = ["a", "an", "and", "ant", "any", "app", "apple", "apt", "bat", "bath", "bad", "ban", "band", "can", "cane", "cart", "car", "cat", "do", "dog", "dot", "to", "tea", "ten", "tent"]


def trie_random_ops():
    pool = RNG.sample(WORDS, RNG.randint(4, 12))
    ops = []
    for _ in range(RNG.randint(4, 20)):
        r = RNG.random()
        word = RNG.choice(pool)
        if r < 0.45:
            ops.append(("insert", word))
        elif r < 0.6:
            ops.append(("search", word))
        elif r < 0.7:
            ops.append(("prefix", word[: RNG.randint(0, len(word))]))
        elif r < 0.93:
            ops.append(("delete", word[: RNG.randint(1, len(word))] if RNG.random() < 0.2 else word))
        else:
            ops.append(("words",))
    return ops


def trie_cases(count):
    cases = [trie_case(ops) for ops in TRIE_FIXED]
    while len(cases) < count:
        cases.append(trie_case(trie_random_ops()))
    return cases


# ---------- suffix tree ----------


def suffix_dump(node):
    return [node.start, node.end, node.suffix_index, [[ch, suffix_dump(child)] for ch, child in node.children.items()]]


class TracedSuffixTree(SuffixTree):
    """Records the tree after each suffix and every edge split, then lets the parent build."""

    def __init__(self, text):
        self.build = []
        self._splits = []
        super().__init__(text)

    def _insert_suffix(self, start_idx):
        self._splits = []
        super()._insert_suffix(start_idx)
        self.build.append({"tree": suffix_dump(self.root), "splits": self._splits})

    def _split_edge(self, parent, char, split_pos, text_pos, suffix_idx):
        self._splits.append([split_pos, text_pos, suffix_idx])
        super()._split_edge(parent, char, split_pos, text_pos, suffix_idx)


def suffix_case(text, patterns):
    st = TracedSuffixTree(text)
    return {"text": text, "build": st.build, "searches": [[p, st.search(p)] for p in patterns]}


SUFFIX_FIXED = [
    ("banana", ["ana", "na", "a", "ban", "banana", "nab", "x", "bananas", ""]),
    ("abac", ["ac", "a", "ba", "c", "abc"]),
    ("mississipp", ["issi", "ss", "p", "s", "sip", "pi"]),
    ("aaaa", ["a", "aa", "aaaa", "aaaaa", "b"]),
    ("abcabx", ["ab", "abx", "bca", "x", "abc"]),
    ("a", ["a", "aa", ""]),
    ("abab", ["ab", "bab", "b", "abb"]),
    ("xyzzy", ["zy", "z", "y", "zz", "xyzzy"]),
]


def suffix_random():
    text = "".join(RNG.choice("ab" if RNG.random() < 0.5 else "abc") for _ in range(RNG.randint(1, 10)))
    patterns = []
    for _ in range(RNG.randint(1, 6)):
        if RNG.random() < 0.6 and text:
            i = RNG.randrange(len(text))
            patterns.append(text[i : i + RNG.randint(1, 4)])
        else:
            patterns.append("".join(RNG.choice("abc") for _ in range(RNG.randint(1, 4))))
    return text, patterns


def suffix_cases(count):
    cases = [suffix_case(text, patterns) for text, patterns in SUFFIX_FIXED]
    while len(cases) < count:
        cases.append(suffix_case(*suffix_random()))
    return cases


def main():
    sections = {
        "bTree": btree_cases(60),
        "bPlusTree": bplus_cases(40),
        "trie": trie_cases(40),
        "suffixTree": suffix_cases(50),
    }
    header = {
        "generator": "web/scripts/gen_multiwayTrees_fixtures.py",
        "reference": "Data_Structures/Non_Linear/Trees (B_Tree/Python/b_tree.py, B_Plus_Tree/Python/b_plus_tree.py, Trie/Python/trie.py, Suffix_Tree/Python/suffix_tree.py)",
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
