"""Generate golden fixtures for the second set of problem-pattern visualizations.

The web visualizer re-implements six Problem_Patterns topics in TypeScript
(web/src/viz/algorithms/meetInTheMiddle.ts, bitManipulation.ts, dpPatterns.ts,
coordinateCompression.ts, graphTraversalProblems.ts, inclusionExclusion.ts). These fixtures
pin each port to the Python functions in Problem_Patterns/<topic>/Python. Intermediate values
are read with sys.settrace (a line tracer that copies local variables just before a chosen
line runs) or by wrapping a module attribute, never by changing the topic code:

- mitm: closest_subset_sum: both halves' subset sums in generation order, the right sums
  after sorting, every left sum that is skipped or searched (remaining, the bisect_right
  index and the candidate total), and the result or the ValueError message;
- bits: every operation's return value, the n of every Kernighan round of count_set_bits
  (count_differing_bits included), every shift of highest_set_bit and next_power_of_two,
  and subset_generation(n) for n = 0..5;
- knapsack: every dp[w] update of knapsack_01 (item, w, old value, candidate) and the result;
  lcs: the strings after the swap, the curr row after every i, and the result; lis: the
  tails list before each number and the result (the 'lis-tails' tracer must agree);
- compress: compress_coordinates in dict order, the rank of every value, the decompressed
  list, and both mappings of compress_2d_coordinates;
- islands: the cell that starts each island and the stack before every pop of sink();
  bfs: every (node, dist) taken from the queue and the result; dfs: the stack before every
  pop of get_dfs_traversal and its result; topo: the in-degrees, the order and the result,
  or the KeyError of an edge whose endpoint is not a node;
- divisible / union: for every mask, the subset size and its lcm or intersection size, and
  the result.

Run from anywhere:

    python3 web/scripts/gen_patternsMore_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/patternsMore.json. CI regenerates the file
and fails if it changed, which means the two implementations drifted.
"""

import copy
import inspect
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PATTERNS = ROOT / "Problem_Patterns"
for topic in (
    "Meet_in_the_Middle",
    "Bit_Manipulation",
    "DP_Problem_Patterns",
    "Coordinate_Compression",
    "Graph_Traversal_Problems",
    "Inclusion_Exclusion_Principle",
):
    sys.path.insert(0, str(PATTERNS / topic / "Python"))

import bit_manipulation as bm  # noqa: E402
import coordinate_compression as cc  # noqa: E402
import dp_patterns as dp  # noqa: E402
import graph_traversal as gt  # noqa: E402
import inclusion_exclusion as ie  # noqa: E402
import meet_in_middle as mim  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "patternsMore.json"
RNG = random.Random(20261116)


# ---------- a line tracer: copy locals just before chosen lines run ----------


def lines_of(func, text, occurrence=None):
    """Absolute line numbers of the statements in func whose stripped source equals text."""
    source, start = inspect.getsourcelines(func)
    found = [start + k for k, line in enumerate(source) if line.strip() == text]
    if not found:
        raise SystemExit(f"{func.__name__}: no line {text!r}; update the generator")
    return found if occurrence is None else [found[occurrence]]


class LineWatch:
    """Run a call with sys.settrace and call on_line(name, f_locals) before each watched line."""

    def __init__(self, watched):
        # watched: list of (func, line text, name)
        self.targets = {}
        self.files = set()
        for func, text, name in watched:
            filename = func.__code__.co_filename
            self.files.add(filename)
            for number in lines_of(func, text):
                self.targets[(filename, number)] = name
        self.events = []

    def _local(self, frame, event, arg):
        if event == "line":
            name = self.targets.get((frame.f_code.co_filename, frame.f_lineno))
            if name is not None:
                # Copy now: the lists in the frame keep changing after this line.
                self.events.append((name, copy.deepcopy(dict(frame.f_locals))))
        return self._local

    def _global(self, frame, event, arg):
        if frame.f_code.co_filename in self.files:
            return self._local
        return None

    def run(self, fn, *args):
        sys.settrace(self._global)
        try:
            return fn(*args)
        finally:
            sys.settrace(None)


def dump_sections(sections, header):
    parts = []
    for name, cases in sections.items():
        lines = [json.dumps(c, separators=(",", ":")) for c in cases]
        parts.append(json.dumps(name) + ": [\n" + ",\n".join(lines) + "\n]")
    return json.dumps(header)[:-1] + ",\n" + ",\n".join(parts) + "\n}\n"


# ---------- meet in the middle ----------


def mitm_case(nums, target):
    halves = []
    original = mim.get_subset_sums

    def recording(arr):
        sums = original(arr)
        halves.append(list(sums))
        return sums

    watch = LineWatch(
        [
            (mim.closest_subset_sum, "max_sum = 0", "sorted"),
            (mim.closest_subset_sum, "continue", "skip"),
            (mim.closest_subset_sum, "if idx > 0:", "search"),
            (mim.closest_subset_sum, "max_sum = max(max_sum, current_sum)", "total"),
        ]
    )
    mim.get_subset_sums = recording
    case = {"nums": nums, "target": target}
    try:
        case["result"] = watch.run(mim.closest_subset_sum, list(nums), target)
    except ValueError as exc:
        case["error"] = f"ValueError: {exc}"
    finally:
        mim.get_subset_sums = original
    visits = []
    for name, loc in watch.events:
        if name == "sorted":
            case["sorted"] = list(loc["right_sums"])
        elif name == "skip":
            visits.append({"l": loc["l_sum"], "skip": True})
        elif name == "search":
            visits.append({"l": loc["l_sum"], "remaining": loc["remaining"], "idx": loc["idx"]})
        else:
            visits[-1]["total"] = loc["current_sum"]
    if halves:
        case["left"], case["right"] = halves
        case["visits"] = visits
    return case


def mitm_cases():
    cases = [
        ([5, 3, 2, 7, 10], 14),
        ([5, 3, 2, 7, 10], 100),
        ([5, 3, 2, 7, 10], 1),
        ([5, 3, 2, 7, 10], 7),
        ([], 10),
        ([9], 8),
        ([9], 9),
        ([4, 4, 4], 9),
        ([1, 2, 3], 0),
        ([3, -1, 2], 4),
        ([1, 2, 3], -1),
        ([], -1),
        ([8, 6, 7, 5, 3, 0, 9, 4], 20),
        ([0, 0, 0], 0),
    ]
    for _ in range(80):
        nums = [RNG.randint(0, RNG.choice([12, 60, 999])) for _ in range(RNG.randint(0, 8))]
        cases.append((nums, RNG.randint(0, max(1, sum(nums) + 5))))
    return [mitm_case(nums, target) for nums, target in cases]


# ---------- bit manipulation ----------

BIT_OPS = {
    "power": bm.is_power_of_two,
    "count": bm.count_set_bits,
    "get": bm.get_bit,
    "set": bm.set_bit,
    "clear": bm.clear_bit,
    "toggle": bm.toggle_bit,
    "lowest": bm.lowest_set_bit,
    "highest": bm.highest_set_bit,
    "diff": bm.count_differing_bits,
    "swap": bm.swap_without_temp,
    "even": bm.is_even,
    "next": bm.next_power_of_two,
}
TWO_ARGS = {"get", "set", "clear", "toggle", "diff", "swap"}
POSITION = {"get", "set", "clear", "toggle"}


def bit_op_case(op):
    name, args = op[0], op[1:]
    watch = LineWatch(
        [
            (bm.count_set_bits, "n &= (n - 1)", "kernighan"),
            (bm.highest_set_bit, "n >>= 1", "shift"),
            (bm.next_power_of_two, "power <<= 1", "double"),
        ]
    )
    result = watch.run(BIT_OPS[name], *args)
    # Integers as strings: the 64-bit masked values pass 2^53, which JSON numbers cannot hold.
    if isinstance(result, bool):
        shown = result
    elif isinstance(result, tuple):
        shown = [str(v) for v in result]
    else:
        shown = str(result)
    case = {"op": op, "result": shown}
    steps = {}
    for event, loc in watch.events:
        key = {"kernighan": "n", "shift": "n", "double": "power"}[event]
        steps.setdefault(event, []).append(str(loc[key]))
    case.update(steps)
    return case


def random_bit_op():
    name = RNG.choice(sorted(BIT_OPS))
    value = RNG.choice([RNG.randint(-999, 9999), RNG.randint(-40, 300), RNG.choice([0, 1, -1, 2, 1024, 4096, -1024, 9999, -999])])
    if name in POSITION:
        return [name, value, RNG.randint(0, 15)]
    if name in TWO_ARGS:
        return [name, value, RNG.choice([RNG.randint(-999, 9999), value, -value])]
    return [name, value]


def bits_cases():
    fixed = [
        ["power", 16], ["power", 15], ["power", 0], ["power", -4], ["power", 1], ["power", 1024],
        ["count", 13], ["count", 0], ["count", 255], ["count", -1], ["count", -8], ["count", -999], ["count", 9999],
        ["get", 13, 2], ["get", 13, 1], ["get", -1, 15], ["get", -999, 3], ["get", 0, 5],
        ["set", 8, 1], ["set", 7, 0], ["set", -999, 15], ["set", 9999, 15],
        ["clear", 15, 2], ["clear", 8, 0], ["clear", -1, 15], ["clear", -999, 4],
        ["toggle", 13, 1], ["toggle", 0, 3], ["toggle", -999, 15], ["toggle", 9999, 13],
        ["lowest", 12], ["lowest", 0], ["lowest", -12], ["lowest", -999], ["lowest", 8],
        ["highest", 13], ["highest", 1], ["highest", 0], ["highest", -1], ["highest", 9999],
        ["diff", 7, 10], ["diff", -1, 0], ["diff", -1, -1], ["diff", 42, 42], ["diff", -999, 999],
        ["swap", 3, 7], ["swap", 4, 4], ["swap", -3, 7], ["swap", 0, -999],
        ["even", 0], ["even", 4], ["even", -1], ["even", -4], ["even", 99],
        ["next", 13], ["next", 0], ["next", 1], ["next", 16], ["next", -5], ["next", 9999], ["next", 1025],
    ]
    ops = fixed + [random_bit_op() for _ in range(160)]
    out = [bit_op_case(op) for op in ops]
    subsets = [{"op": ["subsets", n], "result": bm.subset_generation(n)} for n in range(6)]
    return out + subsets


# ---------- DP patterns ----------


def knapsack_case(weights, values, capacity):
    watch = LineWatch([(dp.knapsack_01, "dp[w] = max(dp[w], dp[w - weights[i]] + values[i])", "update")])
    result = watch.run(dp.knapsack_01, weights, values, capacity)
    updates = []
    for _, loc in watch.events:
        d, i, w = loc["dp"], loc["i"], loc["w"]
        updates.append([i, w, d[w], d[w - weights[i]] + values[i]])
    return {"weights": weights, "values": values, "capacity": capacity, "updates": updates, "result": result}


def knapsack_cases():
    cases = [
        ([10, 20, 30], [60, 100, 120], 15),
        ([1, 3, 4, 5], [1, 4, 5, 7], 7),
        ([1, 3, 4, 5], [1, 4, 5, 7], 0),
        ([], [], 10),
        ([0], [5], 0),
        ([0, 3], [5, 4], 2),
        ([5], [10], 15),
        ([6, 5, 5], [30, 20, 20], 10),
        ([4, 5], [10, 12], 3),
        ([2, 2, 2], [3, 3, 3], 5),
    ]
    for _ in range(60):
        k = RNG.randint(0, 6)
        weights = [RNG.randint(0, RNG.choice([5, 9, 20])) for _ in range(k)]
        values = [RNG.randint(0, RNG.choice([9, 99, 999])) for _ in range(k)]
        cases.append((weights, values, RNG.randint(0, 15)))
    return [knapsack_case(*c) for c in cases]


def lcs_case(a, b):
    watch = LineWatch(
        [
            (dp.lcs, "m, n = len(text1), len(text2)", "swap"),
            (dp.lcs, "prev[:] = curr[:]", "row"),
        ]
    )
    result = watch.run(dp.lcs, a, b)
    case = {"a": a, "b": b, "rows": [], "result": result}
    for name, loc in watch.events:
        if name == "swap":
            case["text1"], case["text2"] = loc["text1"], loc["text2"]
        else:
            case["rows"].append(list(loc["curr"]))
    return case


def lcs_cases():
    cases = [("abcde", "ace"), ("abc", "abc"), ("abc", "def"), ("", "abc"), ("abc", ""), ("", ""), ("abcbdab", "bdcaba"), ("ab", "ba"), ("ace", "abcde"), ("AGGTAB", "GXTXAYB")]
    for _ in range(60):
        alpha = RNG.choice(["ab", "abc", "ABCD", "acgt", "xy01"])
        cases.append(tuple("".join(RNG.choice(alpha) for _ in range(RNG.randint(0, 10))) for _ in range(2)))
    return [lcs_case(a, b) for a, b in cases]


def lis_case(nums):
    watch = LineWatch([(dp.lis, "idx = bisect.bisect_left(tails, num)", "place")])
    result = watch.run(dp.lis, nums)
    return {"nums": nums, "tails": [list(loc["tails"]) for _, loc in watch.events], "result": result}


def lis_cases():
    cases = [[10, 9, 2, 5, 3, 7, 101, 18], [0, 1, 0, 3, 2, 3], [7, 7, 7, 7], [10, 9, 2, 5, 3], [5, 4, 3, 2, 1], [1]]
    for _ in range(50):
        cases.append([RNG.randint(-20, 20) for _ in range(RNG.randint(1, 14))])
    return [lis_case(nums) for nums in cases]


# ---------- coordinate compression ----------


def compress_case(coords):
    mapping = cc.compress_coordinates(coords)
    return {
        "coords": coords,
        "mapping": [[k, v] for k, v in mapping.items()],
        "ranks": [mapping[c] for c in coords],
        "decompressed": cc.decompress_coordinates(mapping),
    }


def compress_cases():
    cases = [[1000, 5, 200, 1000, 5, 50], [], [7, -3, 0, -3], [42], [1000, 5, 200, 50], [3, 3, 3], [10 ** 9, -(10 ** 9), 0, 10 ** 9]]
    for _ in range(50):
        span = RNG.choice([9, 99, 10 ** 6, 10 ** 9])
        cases.append([RNG.randint(-span, span) for _ in range(RNG.randint(1, 12))])
    return [compress_case(c) for c in cases]


def compress_2d_case(points):
    x_map, y_map = cc.compress_2d_coordinates([tuple(p) for p in points])
    return {"points": points, "x": [[k, v] for k, v in x_map.items()], "y": [[k, v] for k, v in y_map.items()]}


def compress_2d_cases():
    cases = [[[1000, 500], [5, 10], [200, 300], [5, 500]], [[3, 3]], [[0, 0], [10 ** 9, 10 ** 9], [-(10 ** 9), 7]]]
    for _ in range(40):
        span = RNG.choice([9, 999, 10 ** 9])
        cases.append([[RNG.randint(-span, span), RNG.randint(-span, span)] for _ in range(RNG.randint(1, 8))])
    return [compress_2d_case(p) for p in cases]


# ---------- graph traversal problems ----------


def islands_case(rows):
    grid = [list(r) for r in rows]
    watch = LineWatch(
        [
            (gt.num_islands, "count += 1", "island"),
            (gt.num_islands, "cr, cc = stack.pop()", "pop"),
        ]
    )
    result = watch.run(gt.num_islands, grid)
    starts, pops = [], []
    for name, loc in watch.events:
        if name == "island":
            starts.append([loc["r"], loc["c"]])
        else:
            pops.append([list(cell) for cell in loc["stack"]])
    return {"grid": rows, "starts": starts, "stacks": pops, "result": result, "after": ["".join(r) for r in grid]}


def islands_cases():
    cases = [
        ["11110", "11010", "11000", "00000"],
        ["11000", "11000", "00100", "00011"],
        ["1"],
        ["0"],
        ["10101", "01010", "10101"],
        ["1111111111"] * 8,
        ["0000"],
    ]
    for _ in range(40):
        r, c = RNG.randint(1, 8), RNG.randint(1, 10)
        p = RNG.choice([0.3, 0.5, 0.7])
        cases.append(["".join("1" if RNG.random() < p else "0" for _ in range(c)) for _ in range(r)])
    return [islands_case(g) for g in cases]


def random_graph(nodes):
    """An adjacency dict over a few node ids, some neighbours not being keys (sinks)."""
    ids = RNG.sample(range(0, 12), nodes)
    keys = ids[: max(1, nodes - RNG.randint(0, 2))]
    graph = {}
    for u in keys:
        graph[u] = RNG.sample([v for v in ids if v != u], RNG.randint(0, min(3, nodes - 1)))
    return graph


def bfs_case(graph, start, target):
    watch = LineWatch([(gt.bfs_shortest_path, "if node == target:", "pop")])
    result = watch.run(gt.bfs_shortest_path, graph, start, target)
    return {
        "graph": [[u, vs] for u, vs in graph.items()],
        "start": start,
        "target": target,
        "pops": [[loc["node"], loc["dist"]] for _, loc in watch.events],
        "result": result,
    }


def bfs_cases():
    g = {0: [1, 2], 1: [0, 3], 2: [0, 3, 4], 3: [1, 2], 4: [2]}
    g2 = {0: [1, 2], 1: [0, 3], 2: [0, 3], 3: [1, 2, 4], 4: [3]}
    cases = [(g, 0, 3), (g, 0, 4), (g, 0, 5), (g2, 0, 4), ({0: [1]}, 0, 1), ({0: [1], 1: [2]}, 0, 2), ({0: [1]}, 0, 7), ({0: [1]}, 5, 0), (g, 2, 2)]
    for _ in range(50):
        graph = random_graph(RNG.randint(2, 8))
        nodes = sorted(set(graph) | {v for vs in graph.values() for v in vs})
        cases.append((graph, RNG.choice(list(graph)), RNG.choice(nodes + [99])))
    return [bfs_case(*c) for c in cases]


def dfs_case(graph, start):
    watch = LineWatch([(gt.get_dfs_traversal, "node = stack.pop()", "pop")])
    result = watch.run(gt.get_dfs_traversal, graph, start)
    case = {"graph": [[u, vs] for u, vs in graph.items()], "start": start, "stacks": [list(loc["stack"]) for _, loc in watch.events], "result": result}
    if start in graph:
        visited, order = set(), []
        gt.dfs_recursive(graph, start, visited, order)
        case["recursive"] = order
    return case


def dfs_cases():
    g = {0: [1, 2], 1: [0, 3], 2: [0, 3, 4], 3: [1, 2], 4: [2]}
    cases = [(g, 0), (g, 9), (g, 3), ({0: [1, 2, 3], 1: [3], 2: [3], 3: []}, 0), ({0: [0]}, 0)]
    for _ in range(50):
        graph = random_graph(RNG.randint(2, 8))
        cases.append((graph, RNG.choice(list(graph))))
    return [dfs_case(*c) for c in cases]


def topo_case(n, edges):
    watch = LineWatch(
        [
            (gt.topological_sort, "result = []", "indegree"),
            (gt.topological_sort, "result.append(node)", "take"),
        ]
    )
    case = {"n": n, "edges": edges}
    try:
        case["result"] = watch.run(gt.topological_sort, n, [list(e) for e in edges])
    except KeyError as exc:
        case["error"] = f"KeyError: {exc}"
    for name, loc in watch.events:
        if name == "indegree":
            case["indegree"] = [loc["in_degree"][v] for v in range(n)]
        else:
            case.setdefault("taken", []).append(loc["node"])
    return case


def topo_cases():
    cases = [
        (4, [[1, 0], [2, 0], [3, 1], [3, 2]]),
        (3, [[0, 1], [1, 2]]),
        (2, [[0, 1], [1, 0]]),
        (0, [[0, 1]]),
        (-1, []),
        (3, []),
        (3, [[0, 3]]),
        (3, [[0, 1], [5, 2]]),
        (3, [[-1, 0]]),
        (3, [[1, 1]]),
        (4, [[0, 1], [0, 1], [1, 2], [2, 3]]),
        (6, [[5, 2], [5, 0], [4, 0], [4, 1], [2, 3], [3, 1]]),
    ]
    for _ in range(50):
        n = RNG.randint(1, 9)
        edges = []
        for _ in range(RNG.randint(0, 12)):
            u, v = RNG.randrange(n), RNG.randrange(n)
            if RNG.random() < 0.85 and u > v:
                u, v = v, u
            edges.append([u, v])
        if RNG.random() < 0.1:
            edges.append([RNG.randrange(n), n + RNG.randint(0, 3)])
        cases.append((n, edges))
    return [topo_case(*c) for c in cases]


# ---------- inclusion-exclusion ----------


def divisible_case(n, divisors):
    watch = LineWatch([(ie.count_divisible, "if count % 2 == 1:", "term")])
    result = watch.run(ie.count_divisible, n, divisors)
    terms = [[loc["i"], loc["count"], loc["lcm"]] for _, loc in watch.events]
    return {"n": n, "divisors": divisors, "terms": terms, "result": result}


def divisible_cases():
    cases = [(100, [2, 3]), (100, [2, 3, 5]), (30, [4, 6]), (100, [2, 4]), (10, [1]), (0, [2, 3]), (-10, [3]), (-10, [2, 3]), (10 ** 9, [7, 11, 13]), (1, [2, 3, 5]), (60, [6, 10, 15]), (100, [5, 5])]
    for _ in range(60):
        k = RNG.randint(1, 3)
        divisors = [RNG.randint(1, RNG.choice([10, 30, 999])) for _ in range(k)]
        cases.append((RNG.choice([RNG.randint(-20, 200), RNG.randint(0, 10 ** 9)]), divisors))
    return [divisible_case(*c) for c in cases]


def union_case(sets):
    watch = LineWatch([(ie.count_union_sets, "if count % 2 == 1:", "term")])
    result = watch.run(ie.count_union_sets, sets)
    terms = [[loc["i"], loc["count"], len(loc["intersection"])] for _, loc in watch.events]
    return {"sets": sets, "terms": terms, "result": result}


def union_cases():
    cases = [[[1, 2, 3], [2, 3, 4], [3, 4, 5]], [[1], [2]], [[1, 2], [1, 2]], [[], [7]], [[5, 5, 6]], [[1, 2], [2, 3]], [[], [], []]]
    for _ in range(50):
        k = RNG.randint(1, 3)
        cases.append([[RNG.randint(0, RNG.choice([5, 9, 99])) for _ in range(RNG.randint(0, 6))] for _ in range(k)])
    return [union_case(s) for s in cases]


def main():
    sections = {
        "mitm": mitm_cases(),
        "bits": bits_cases(),
        "knapsack": knapsack_cases(),
        "lcs": lcs_cases(),
        "lis": lis_cases(),
        "compress": compress_cases(),
        "compress2d": compress_2d_cases(),
        "islands": islands_cases(),
        "bfs": bfs_cases(),
        "dfs": dfs_cases(),
        "topo": topo_cases(),
        "divisible": divisible_cases(),
        "union": union_cases(),
    }
    header = {
        "generator": "web/scripts/gen_patternsMore_fixtures.py",
        "reference": "Problem_Patterns/*/Python: closest_subset_sum, the bit_manipulation functions, knapsack_01, lcs, lis, "
        "compress_coordinates, decompress_coordinates, compress_2d_coordinates, num_islands, bfs_shortest_path, "
        "get_dfs_traversal, topological_sort, count_divisible, count_union_sets",
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(dump_sections(sections, header), encoding="ascii")
    print(f"wrote {sum(len(c) for c in sections.values())} cases to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
