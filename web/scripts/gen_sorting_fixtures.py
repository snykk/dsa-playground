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
for topic in ("Counting_Sort", "Radix_Sort", "Bucket_Sort", "Shell_Sort"):
    sys.path.insert(0, str(ROOT / "Algorithms" / "Sorting" / topic / "Python"))

from bucket_sort import bucket_sort  # noqa: E402
from counting_sort import counting_sort  # noqa: E402
from radix_sort import radix_sort  # noqa: E402
import shell_sort as shell_module  # noqa: E402

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
    OUT_COMPARISON.write_text(dump({"shell-sort": make_shell_cases()}))
    print(f"wrote {OUT_COMPARISON}")


if __name__ == "__main__":
    main()
