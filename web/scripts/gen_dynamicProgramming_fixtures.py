"""Generate golden fixtures for the dynamic-programming visualizations.

The web visualizer re-implements Fibonacci, Climbing Stairs, Coin Change, LIS, Kadane,
Edit Distance and Matrix Chain Multiplication in TypeScript. These fixtures pin each port
to the repository's Python implementation (tie-breaking included). Run from anywhere:

    python3 web/scripts/gen_dynamicProgramming_fixtures.py

then commit web/src/viz/algorithms/__fixtures__/dynamicProgramming.json. CI regenerates
the file and fails if it changed, which means the two implementations drifted.
"""

import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DP = ROOT / "Algorithms" / "Dynamic_Programming"
for folder in (
    "Basic DP/Fibonacci Numbers",
    "Basic DP/Climbing Stairs",
    "Linear DP/Coin Change",
    "Linear DP/Longest Increasing Subsequence",
    "Linear DP/Maximum Subarray (Kadane's Algorithm)",
    "2D DP/Edit Distance",
    "2D DP/Matrix Chain Multiplication",
):
    sys.path.insert(0, str(DP / folder / "Python"))

from climbing_stairs import climbing_stairs_variable_steps  # noqa: E402
from coin_change import coin_change_min_coins  # noqa: E402
from edit_distance import edit_distance  # noqa: E402
from fibonacci import fibonacci_tabulation  # noqa: E402
from kadane import kadane_with_indices  # noqa: E402
from lis import lis_binary_search, lis_with_sequence  # noqa: E402
from matrix_chain import matrix_chain_multiplication  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "dynamicProgramming.json"


def make_sections():
    rng = random.Random(20261111)
    fib = [{"n": n, "value": fibonacci_tabulation(n)} for n in range(0, 21)]

    stairs = []
    for _ in range(40):
        steps = rng.sample([1, 2, 3, 4, 5, 6], rng.randint(1, 4))
        n = rng.randint(0, 20)
        stairs.append({"n": n, "steps": steps, "ways": climbing_stairs_variable_steps(n, steps)})

    coins = []
    for _ in range(60):
        cs = rng.sample(range(1, 13), rng.randint(1, 5))
        amount = rng.randint(0, 30)
        coins.append({"amount": amount, "coins": cs, "min": coin_change_min_coins(cs, amount)})

    lis = []
    for _ in range(60):
        arr = [rng.randint(-9, 9) for _ in range(rng.randint(1, 14))]
        length, seq = lis_with_sequence(arr)
        assert length == lis_binary_search(arr)
        lis.append({"arr": arr, "length": length, "sequence": seq})

    kadane = []
    for _ in range(60):
        arr = [rng.randint(-9, 9) for _ in range(rng.randint(1, 16))]
        total, start, end = kadane_with_indices(arr)
        kadane.append({"arr": arr, "sum": total, "start": start, "end": end})

    edit = []
    for _ in range(60):
        a = "".join(rng.choice("abcd") for _ in range(rng.randint(0, 9)))
        b = "".join(rng.choice("abcd") for _ in range(rng.randint(0, 9)))
        edit.append({"a": a, "b": b, "distance": edit_distance(a, b)})

    mcm = []
    for _ in range(60):
        dims = [rng.randint(1, 40) for _ in range(rng.randint(2, 9))]
        mcm.append({"dims": dims, "cost": matrix_chain_multiplication(dims)})

    return [
        ("fibonacci", fib),
        ("climbing", stairs),
        ("coin", coins),
        ("lis", lis),
        ("kadane", kadane),
        ("edit", edit),
        ("mcm", mcm),
    ]


def main():
    sections = make_sections()
    header = {
        "generator": "web/scripts/gen_dynamicProgramming_fixtures.py",
        "reference": "Algorithms/Dynamic_Programming (fibonacci, climbing_stairs, coin_change, lis, kadane, edit_distance, matrix_chain)",
    }
    parts = [json.dumps(header)[:-1]]
    for name, cases in sections:
        lines = [json.dumps(c, separators=(",", ":")) for c in cases]
        parts.append(f'"{name}": [\n' + ",\n".join(lines) + "\n]")
    body = ",\n".join(parts) + "}\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(body, encoding="ascii")
    print(f"wrote {sum(len(c) for _, c in sections)} cases to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
