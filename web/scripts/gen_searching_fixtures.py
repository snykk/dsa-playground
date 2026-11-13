"""Generate golden searching fixtures from the repository's Python implementations.

The web visualizer re-implements linear, binary, ternary and interpolation search in
TypeScript (web/src/viz/algorithms/searching.ts). These fixtures pin it to the iterative
functions in Algorithms/Searching/<topic>/Python: for every case they record the returned
index and the probes, i.e. which array values were compared with the target for equality,
in order. Arrays with many duplicates make both depend on the exact probe sequence.
Run from anywhere:

    python3 web/scripts/gen_searching_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/searching.json. CI regenerates the file
and fails if it changed, which means the two implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SEARCHING = ROOT / "Algorithms" / "Searching"
for topic in ("Linear_Search", "Binary_Search", "Ternary_Search", "Interpolation_Search"):
    sys.path.insert(0, str(SEARCHING / topic / "Python"))

from binary_search import binary_search  # noqa: E402
from interpolation_search import interpolation_search  # noqa: E402
from linear_search import linear_search  # noqa: E402
from ternary_search import ternary_search  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "searching.json"

SEARCHES = {
    "linear-search": linear_search,
    "binary-search": binary_search,
    "ternary-search": ternary_search,
    "interpolation-search": interpolation_search,
}


def value(x):
    return x.value if isinstance(x, Probe) else x


class Probe:
    """An array element that logs its index whenever it is tested for equality with the target."""

    __hash__ = None

    def __init__(self, index, val, log):
        self.index = index
        self.value = val
        self.log = log

    def __eq__(self, other):
        if isinstance(other, Probe):
            return self.value == other.value
        self.log.append(self.index)
        return self.value == other

    def __lt__(self, other):
        return self.value < value(other)

    def __le__(self, other):
        return self.value <= value(other)

    def __gt__(self, other):
        return self.value > value(other)

    def __ge__(self, other):
        return self.value >= value(other)

    def __sub__(self, other):
        return self.value - value(other)

    def __rsub__(self, other):
        return value(other) - self.value


def run(name, values, target):
    log = []
    result = SEARCHES[name]([Probe(i, v, log) for i, v in enumerate(values)], target)
    return {"search": name, "values": values, "target": target, "result": result, "probes": log}


def make_cases():
    rng = random.Random(20261110)
    classic = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
    cases = []
    for name in SEARCHES:
        # README / example inputs and edge cases shared by every search.
        fixed = [
            (list(range(1, 11)), 7),
            (classic, 23),
            (classic, 40),
            (classic, 1),
            (classic, 99),
            ([42], 42),
            ([42], 7),
            ([5, 5, 5], 5),
            ([5, 5, 5], 4),
            ([1, 2, 2, 2, 2, 3, 4], 2),
            ([1, 3, 3, 3, 3, 3, 8], 3),
            ([7, 7, 7, 7, 7], 7),
            ([10, 20, 30, 40, 50, 60, 70, 80, 90, 100], 70),
            ([10, 20, 30, 40, 50, 60, 70, 80, 90, 100], 55),
            ([2 ** k for k in range(10)], 128),
            ([-999, -10, 0, 3, 999], 0),
            ([-999, -10, 0, 3, 999], -10),
        ]
        for values, target in fixed:
            cases.append(run(name, values, target))
        for _ in range(70):
            n = rng.randint(1, 24)
            spread = rng.choice([2, 5, 30, 400])  # a small spread means many duplicates
            values = [rng.randint(-spread // 3, spread) for _ in range(n)]
            if name == "interpolation-search" and rng.random() < 0.3:
                values = [round(1.7 ** rng.uniform(0, 12)) for _ in range(n)]  # skewed growth
            if name != "linear-search":
                values.sort()
            if rng.random() < 0.65:
                target = rng.choice(values)
            else:
                target = rng.randint(min(values) - 2, max(values) + 2)
            cases.append(run(name, values, target))
    return cases


def main():
    cases = make_cases()
    header = {
        "generator": "web/scripts/gen_searching_fixtures.py",
        "reference": "Algorithms/Searching/*/Python: linear_search, binary_search, ternary_search, interpolation_search",
        "probes": "indices whose value was compared with the target for equality, in order",
    }
    lines = [json.dumps(c, separators=(",", ":")) for c in cases]
    body = json.dumps(header)[:-1] + ', "cases": [\n' + ",\n".join(lines) + "\n]}\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="ascii")
    print(f"wrote {len(cases)} cases to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
