"""Generate golden problem-pattern fixtures from the repository's Python implementations.

The web visualizer re-implements two pointers, the variable sliding window, prefix sums,
the difference array, the monotonic stack and queue and binary search on the answer in
TypeScript (web/src/viz/algorithms/patterns.ts). These fixtures pin it to the Python
functions in Problem_Patterns/<topic>/Python: for every case they record the arguments and
the value the Python function returns. Run from anywhere:

    python3 web/scripts/gen_patterns_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/patterns.json. CI regenerates the file
and fails if it changed, which means the two implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PATTERNS = ROOT / "Problem_Patterns"
for topic in (
    "Two_Pointers",
    "Sliding_Window",
    "Prefix_Sum_Difference_Array",
    "Monotonic_Stack",
    "Monotonic_Queue",
    "Binary_Search_on_Answer",
):
    sys.path.insert(0, str(PATTERNS / topic / "Python"))

from binary_search_on_answer import find_min_capacity  # noqa: E402
from monotonic_queue import sliding_window_max  # noqa: E402
from monotonic_stack import next_greater_element  # noqa: E402
from prefix_sum import range_sum_queries, range_updates  # noqa: E402
from sliding_window import longest_substring_k_distinct  # noqa: E402
from two_pointers import two_sum_sorted  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "patterns.json"
RNG = random.Random(20261111)


def ints(n, lo, hi):
    return [RNG.randint(lo, hi) for _ in range(n)]


def two_pointers_cases():
    cases = [([2, 7, 11, 15], 9), ([1, 2, 3, 4, 6], 6), ([1, 2], 10), ([3, 3], 6), ([-5, -1, 0, 4, 9], 4)]
    for _ in range(60):
        a = sorted(ints(RNG.randint(2, 16), -30, 30))
        cases.append((a, RNG.choice([RNG.randint(-60, 60), a[0] + a[-1], a[1] + a[-1]])))
    return [{"values": a, "target": t, "result": two_sum_sorted(a, t)} for a, t in cases]


def k_distinct_cases():
    cases = [("eceba", 2), ("aa", 1), ("abcabcbb", 3), ("a", 1), ("abaccc", 2), ("abc", 10)]
    for _ in range(60):
        alpha = RNG.choice(["ab", "abc", "abcd", "abcdefgh12"])
        s = "".join(RNG.choice(alpha) for _ in range(RNG.randint(1, 24)))
        cases.append((s, RNG.randint(1, 6)))
    return [{"s": s, "k": k, "result": longest_substring_k_distinct(s, k)} for s, k in cases]


def prefix_cases():
    out = []
    for _ in range(60):
        a = ints(RNG.randint(1, 16), -99, 99)
        qs = []
        for _ in range(RNG.randint(1, 6)):
            l = RNG.randint(0, len(a) - 1)
            qs.append([l, RNG.randint(l, len(a) - 1)])
        out.append({"values": a, "queries": qs, "result": range_sum_queries(a, [tuple(q) for q in qs])})
    return out


def difference_cases():
    out = []
    for _ in range(60):
        a = ints(RNG.randint(1, 16), -99, 99)
        ups = []
        for _ in range(RNG.randint(1, 6)):
            l = RNG.randint(0, len(a) - 1)
            ups.append([l, RNG.randint(l, len(a) - 1), RNG.randint(-50, 50)])
        out.append({"values": a, "updates": ups, "result": range_updates(a, [tuple(u) for u in ups])})
    return out


def stack_cases():
    cases = [[2, 1, 2, 4, 3], [5, 4, 3, 2, 1], [1, 2, 3, 4, 5], [7], [3, 3, 3], [-1, -1, 0, -1]]
    for _ in range(60):
        cases.append(ints(RNG.randint(1, 16), RNG.choice([-3, -99]), RNG.choice([3, 99])))
    return [{"values": a, "result": next_greater_element(a)} for a in cases]


def queue_cases():
    cases = [([1, 3, -1, -3, 5, 3, 6, 7], 3), ([5, 5, 1], 2), ([3, 3, 3, 1, 1], 3), ([9], 1), ([4, 2, 12, 3], 4)]
    for _ in range(60):
        a = ints(RNG.randint(1, 16), RNG.choice([-3, -99]), RNG.choice([3, 99]))
        cases.append((a, RNG.randint(1, len(a))))
    return [{"values": a, "k": k, "result": sliding_window_max(a, k)} for a, k in cases]


def ship_cases():
    cases = [([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5), ([3, 2, 2, 4, 1, 4], 3), ([1, 2, 3, 1, 1], 4), ([7], 1), ([5, 5], 0)]
    for _ in range(60):
        w = ints(RNG.randint(1, 12), 1, 50)
        cases.append((w, RNG.randint(0, 14)))
    return [{"weights": w, "days": d, "result": find_min_capacity(w, d)} for w, d in cases]


def main():
    sections = {
        "two-pointers": two_pointers_cases(),
        "sliding-window": k_distinct_cases(),
        "prefix-sum": prefix_cases(),
        "difference-array": difference_cases(),
        "monotonic-stack": stack_cases(),
        "monotonic-queue": queue_cases(),
        "binary-search-on-answer": ship_cases(),
    }
    header = {
        "generator": "web/scripts/gen_patterns_fixtures.py",
        "reference": "Problem_Patterns/*/Python: two_sum_sorted, longest_substring_k_distinct, range_sum_queries, "
        "range_updates, next_greater_element, sliding_window_max, find_min_capacity",
    }
    parts = []
    for name, cases in sections.items():
        lines = [json.dumps(c, separators=(",", ":")) for c in cases]
        parts.append(json.dumps(name) + ": [\n" + ",\n".join(lines) + "\n]")
    body = json.dumps(header)[:-1] + ",\n" + ",\n".join(parts) + "\n}\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="ascii")
    print(f"wrote {sum(len(c) for c in sections.values())} cases to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
