"""Generate golden fixtures for the sorting visualizations from the repository's Python code.

The web visualizer re-implements counting, radix and bucket sort in TypeScript
(web/src/viz/algorithms/sortingLinear.ts). These fixtures pin the sorted output of
each tracer to the functions in Algorithms/Sorting/<topic>/Python, including negative
input for counting and radix sort and the value 1.0 for bucket sort.

Shell Sort (web/src/viz/algorithms/shellSort.ts, section "shell-sort" of sorting.json)
is pinned more closely: for each input and gap sequence, the gaps, the list after
every pass (shell_sort.h_sort is wrapped while it runs) and the comparisons and shifts
(the values are wrapped so that every > is counted; a shift is a > that returns True).
Its cases come from their own random seed, so adding them changed no other fixture.

Timsort (web/src/viz/algorithms/timsort.ts, section "timsort") is pinned the same way,
with its own seed: for each input and minrun, the natural runs (count_run), the run
lengths on the stack after every merge_collapse, every merge (merge_at's stack index,
what is left of the two runs after trimming, merge_lo or merge_hi, and min_gallop
afterwards), the number of galloping searches, the comparisons (every < is counted)
and the output order of equal keys (each value carries its input index).
Run from anywhere:

    python3 web/scripts/gen_sorting_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/sortingLinear.json and sorting.json.
CI regenerates the files and fails if one changed, which means the two
implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
for topic in ("Counting_Sort", "Radix_Sort", "Bucket_Sort", "Shell_Sort", "Timsort"):
    sys.path.insert(0, str(ROOT / "Algorithms" / "Sorting" / topic / "Python"))

from bucket_sort import bucket_sort  # noqa: E402
from counting_sort import counting_sort  # noqa: E402
from radix_sort import radix_sort  # noqa: E402
import shell_sort as shell_module  # noqa: E402
import timsort as tim_module  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "sortingLinear.json"
OUT_COMPARISON = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "sorting.json"


def make_cases():
    rng = random.Random(20261111)
    counting, radix, bucket = [], [], []
    for lo, hi in [(0, 9), (-5, 4), (-20, 3), (3, 3), (7, 28)]:
        counting.append([rng.randint(lo, hi) for _ in range(rng.randint(2, 16))])
    counting += [[2, 1], [-3, -1, -2, -3], [0, 0]]
    for lo, hi in [(0, 99), (0, 999), (-999, 999), (-9, -1), (5, 5), (-120, 15)]:
        for _ in range(3):
            radix.append([rng.randint(lo, hi) for _ in range(rng.randint(2, 16))])
    radix += [[0, 0], [10, 1], [-1, 0]]
    for _ in range(14):
        bucket.append([rng.randint(0, 100) / 100 for _ in range(rng.randint(2, 16))])
    bucket += [[1.0, 0.0], [0.5, 1.0, 0.25], [0.99, 0.991, 0.999, 1.0]]
    return counting, radix, bucket


class Counted:
    """A value whose > counts comparisons, and shifts (the comparisons that return True)."""

    comparisons = 0
    shifts = 0

    def __init__(self, value):
        self.value = value

    def __gt__(self, other):
        Counted.comparisons += 1
        result = self.value > other.value
        if result:
            Counted.shifts += 1
        return result


def shell_case(values, sequence):
    """Run shell_sort.py on values, recording the list after every h_sort pass."""
    passes = []
    real = shell_module.h_sort

    def recorded(arr, gap):
        real(arr, gap)
        passes.append([c.value for c in arr])
        return arr

    Counted.comparisons = Counted.shifts = 0
    arr = [Counted(v) for v in values]
    shell_module.h_sort = recorded
    try:
        shell_module.shell_sort(arr, sequence)
    finally:
        shell_module.h_sort = real
    return {
        "input": list(values),
        "sequence": sequence,
        "gaps": shell_module.gap_sequence(len(values), sequence),
        "passes": passes,
        "comparisons": Counted.comparisons,
        "shifts": Counted.shifts,
    }


def make_shell_cases():
    rng = random.Random(20261124)
    example = [98, 69, 74, 79, 60, 91, 41, 99, 18, 63, 93, 38]
    bad = [1, 9, 2, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15, 8, 16]
    fixed = [example, bad, [2, 1], [5, 5, 5, 5, 5], list(range(1, 13)), list(range(24, 0, -1)), [3, -1, 3, 0, -1, 2, 2]]
    cases = [shell_case(values, seq) for values in fixed for seq in shell_module.SEQUENCES]
    for _ in range(30):
        n = rng.randint(2, 24)
        spread = rng.choice([4, 100])
        values = [rng.randint(-spread // 2, spread) for _ in range(n)]
        cases.append(shell_case(values, rng.choice(shell_module.SEQUENCES)))
    return cases


class Keyed:
    """A value with its input index; < compares the values only and counts the calls."""

    comparisons = 0

    def __init__(self, value, index):
        self.value = value
        self.index = index

    def __lt__(self, other):
        Keyed.comparisons += 1
        return self.value < other.value


def timsort_case(values, minrun):
    """Run timsort.py on values, recording its runs, stacks, merges and galloping searches."""
    record = {"runs": [], "stacks": [], "merges": [], "gallops": 0}
    names = ("count_run", "merge_collapse", "merge_at", "merge_lo", "merge_hi", "gallop_left", "gallop_right")
    real = {name: getattr(tim_module, name) for name in names}
    merging = []

    def count_run(arr, lo, hi):
        length, descending = real["count_run"](arr, lo, hi)
        record["runs"].append([lo, length, descending])
        return length, descending

    def merge_collapse(ms):
        real["merge_collapse"](ms)
        record["stacks"].append([length for _, length in ms.pending])

    def merge_at(ms, i):
        merging.append([i, 0, 0, "none"])
        real["merge_at"](ms, i)
        record["merges"].append(merging.pop() + [ms.min_gallop])

    def merge_with(kind):
        def merge(ms, base_a, na, base_b, nb):
            merging[-1][1:] = [na, nb, kind]
            merging.append(None)  # inside merge_lo or merge_hi: searches from here on gallop
            real["merge_" + kind](ms, base_a, na, base_b, nb)
            merging.pop()
        return merge

    def search(name):
        def gallop(*args):
            if merging and merging[-1] is None:
                record["gallops"] += 1
            return real[name](*args)
        return gallop

    wrappers = {
        "count_run": count_run,
        "merge_collapse": merge_collapse,
        "merge_at": merge_at,
        "merge_lo": merge_with("lo"),
        "merge_hi": merge_with("hi"),
        "gallop_left": search("gallop_left"),
        "gallop_right": search("gallop_right"),
    }
    Keyed.comparisons = 0
    arr = [Keyed(v, i) for i, v in enumerate(values)]
    for name, wrapper in wrappers.items():
        setattr(tim_module, name, wrapper)
    try:
        tim_module.timsort(arr, True, minrun)
    finally:
        for name, function in real.items():
            setattr(tim_module, name, function)
    return {
        "input": list(values),
        "minrun": minrun,
        **record,
        "comparisons": Keyed.comparisons,
        "order": [k.index for k in arr],
    }


def make_timsort_cases():
    rng = random.Random(20261125)
    fixed = [
        ([43, 37, 31, 24, 15, 9, 12, 40, 6, 28, 2, 5, 18, 20, 33, 35, 46, 44, 39, 30, 26, 21, 14, 3], 4),
        ([2, 3, 7, 10, 12, 14, 17, 22, 23, 57, 58, 5, 6, 26, 27, 33, 34, 35, 37, 45, 47, 49, 50, 54], 4),
        ([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 30, 40, 1, 20, 21, 22, 31, 32, 33, 34, 35, 36, 37, 38], 4),
        (list(range(1, 17)), 4),
        (list(range(16, 0, -1)), 4),
        ([5, 3, 5, 1, 3, 5, 1, 3, 2, 4, 2, 4], 4),
        ([3, 3, 2, 2, 1, 1, 9, 8, 7, 7, 6, 5], 2),
        ([2, 1], 4),
        ([4, 1, 3, 2, 5, 9, 7, 8, 6, 0], 0),
        ([9, 8, 7, 1, 2, 3, 6, 5, 4, 0, 10, 11], 1),
        ([7, 7, 7, 7, 7, 7], 4),
        # Blocks of 4 and 26 values take turns: long gallops, and min_gallop falls.
        ([k * 30 + j for k in range(4) for j in range(4)] + [k * 30 + 4 + j for k in range(4) for j in range(26)], 4),
        ([k * 30 + 4 + j for k in range(4) for j in range(26)] + [k * 30 + j for k in range(4) for j in range(4)], 4),
    ]
    cases = [timsort_case(values, minrun) for values, minrun in fixed]
    for _ in range(60):
        n = rng.randint(2, 24)
        kind = rng.choice(["random", "dups", "runs", "clusters"])
        if kind == "random":
            values = [rng.randint(-99, 99) for _ in range(n)]
        elif kind == "dups":
            values = [rng.randint(0, 4) for _ in range(n)]
        elif kind == "clusters":
            # Two long runs whose values interleave in long stretches, so merges gallop.
            pool = sorted(rng.sample(range(1, 100), n))
            first, second, side, i = [], [], 0, 0
            while i < n:
                size = rng.randint(1, 10)
                (first if side == 0 else second).extend(pool[i:i + size])
                i, side = i + size, 1 - side
            values = first + second
        else:
            values = [rng.randint(0, 60) for _ in range(n)]
            start = 0
            while start < n:
                size = rng.randint(2, 9)
                values[start:start + size] = sorted(values[start:start + size], reverse=rng.random() < 0.4)
                start += size
        cases.append(timsort_case(values, rng.choice([1, 2, 3, 4, 4, 4, 6, 8])))
    return cases


def dump(sections):
    lines = ["{"]
    keys = list(sections)
    for ki, key in enumerate(keys):
        lines.append(f'  "{key}": [')
        for i, case in enumerate(sections[key]):
            comma = "," if i < len(sections[key]) - 1 else ""
            lines.append("    " + json.dumps(case) + comma)
        lines.append("  ]" + ("," if ki < len(keys) - 1 else ""))
    lines.append("}")
    return "\n".join(lines) + "\n"


def main():
    counting, radix, bucket = make_cases()
    out = {
        "counting-sort": [{"input": c, "output": counting_sort(list(c))} for c in counting],
        "radix-sort": [{"input": c, "output": radix_sort(list(c))} for c in radix],
        "bucket-sort": [{"input": c, "output": bucket_sort(list(c))} for c in bucket],
    }
    OUT.write_text(dump(out))
    print(f"wrote {OUT}")
    OUT_COMPARISON.write_text(dump({"shell-sort": make_shell_cases(), "timsort": make_timsort_cases()}))
    print(f"wrote {OUT_COMPARISON}")


if __name__ == "__main__":
    main()
