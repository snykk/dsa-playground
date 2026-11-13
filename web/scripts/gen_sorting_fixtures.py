"""Generate golden fixtures for the linear-time sorts from the repository's Python code.

The web visualizer re-implements counting, radix and bucket sort in TypeScript
(web/src/viz/algorithms/sortingLinear.ts). These fixtures pin the sorted output of
each tracer to the functions in Algorithms/Sorting/<topic>/Python, including negative
input for counting and radix sort and the value 1.0 for bucket sort. Run from anywhere:

    python3 web/scripts/gen_sorting_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/sortingLinear.json. CI regenerates
the file and fails if it changed, which means the two implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
for topic in ("Counting_Sort", "Radix_Sort", "Bucket_Sort"):
    sys.path.insert(0, str(ROOT / "Algorithms" / "Sorting" / topic / "Python"))

from bucket_sort import bucket_sort  # noqa: E402
from counting_sort import counting_sort  # noqa: E402
from radix_sort import radix_sort  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "sortingLinear.json"


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


def main():
    counting, radix, bucket = make_cases()
    out = {
        "counting-sort": [{"input": c, "output": counting_sort(list(c))} for c in counting],
        "radix-sort": [{"input": c, "output": radix_sort(list(c))} for c in radix],
        "bucket-sort": [{"input": c, "output": bucket_sort(list(c))} for c in bucket],
    }
    lines = ["{"]
    keys = list(out)
    for ki, key in enumerate(keys):
        lines.append(f'  "{key}": [')
        for i, case in enumerate(out[key]):
            comma = "," if i < len(out[key]) - 1 else ""
            lines.append("    " + json.dumps(case) + comma)
        lines.append("  ]" + ("," if ki < len(keys) - 1 else ""))
    lines.append("}")
    OUT.write_text("\n".join(lines) + "\n")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
