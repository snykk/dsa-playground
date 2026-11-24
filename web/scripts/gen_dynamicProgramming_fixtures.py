"""Generate golden fixtures for the dynamic-programming visualizations.

The web visualizer re-implements Fibonacci, Climbing Stairs, Coin Change, LIS, Kadane,
Edit Distance, Matrix Chain Multiplication, the LCS traceback and the Unbounded Knapsack in TypeScript. These fixtures pin each port
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
    "Basic_DP/Fibonacci_Numbers",
    "Basic_DP/Climbing_Stairs",
    "Linear_DP/Coin_Change",
    "Linear_DP/Unbounded_Knapsack",
    "Linear_DP/Longest_Increasing_Subsequence",
    "Linear_DP/Maximum_Subarray_Kadanes_Algorithm",
    "2D_DP/Edit_Distance",
    "2D_DP/Matrix_Chain_Multiplication",
    "2D_DP/Longest_Common_Subsequence",
):
    sys.path.insert(0, str(DP / folder / "Python"))

from climbing_stairs import climbing_stairs_variable_steps  # noqa: E402
from coin_change import coin_change_min_coins  # noqa: E402
from edit_distance import edit_distance  # noqa: E402
from fibonacci import fibonacci_tabulation  # noqa: E402
from kadane import kadane_with_indices  # noqa: E402
from lcs import lcs_sequence  # noqa: E402
from lis import lis_binary_search, lis_with_sequence  # noqa: E402
from matrix_chain import matrix_chain_multiplication  # noqa: E402
import unbounded_knapsack  # noqa: E402

OUT = ROOT / "web" / "src" / "viz" / "algorithms" / "__fixtures__" / "dynamicProgramming.json"


def unbounded_case(weights, values, capacity):
    """Every _relax call, going up and going down, by wrapping the module-level helper."""
    case = {"weights": weights, "values": values, "capacity": capacity}
    real = unbounded_knapsack._relax
    for name, upward in (("up", True), ("down", False)):
        calls = []

        def spy(dp, choice, item, w, rest, value):
            calls.append([item, w, dp[w], dp[rest] + value])
            real(dp, choice, item, w, rest, value)

        unbounded_knapsack._relax = spy
        try:
            dp, choice = unbounded_knapsack._fill_row(weights, values, capacity, upward)
        finally:
            unbounded_knapsack._relax = real
        case[name] = {"relaxations": calls, "dp": dp, "choice": choice}
    value, counts = unbounded_knapsack.unbounded_knapsack_items(weights, values, capacity)
    assert value == case["up"]["dp"][capacity] == unbounded_knapsack.unbounded_knapsack(weights, values, capacity)
    assert case["down"]["dp"][capacity] == unbounded_knapsack.zero_one_knapsack(weights, values, capacity)
    case["value"], case["counts"], case["once"] = value, counts, case["down"]["dp"][capacity]
    return case


def unbounded_cases():
    # Its own generator, so the other sections keep their values. The fixed cases are the
    # visualization's examples; the random ones stay inside its limits (capacity <= 12, at most
    # 5 items, weights 1..12, values 0..99), with repeated items for the tie rule.
    rng = random.Random(20261124)
    fixed = [
        ([1, 3, 4, 5], [1, 4, 5, 7], 10),
        ([1, 3, 4, 5], [1, 4, 5, 7], 7),
        ([2], [3], 4),
        ([2, 4], [3, 6], 4),
        ([3, 3], [4, 4], 9),
        ([4, 5], [10, 12], 3),
        ([], [], 6),
        ([1, 3, 4, 5], [1, 4, 5, 7], 0),
        ([3], [5], 7),
        ([1, 2], [0, 3], 5),
    ]
    for _ in range(60):
        n = rng.randint(0, 5)
        weights = [rng.randint(1, rng.choice([4, 8, 12])) for _ in range(n)]
        values = [rng.randint(0, rng.choice([9, 30, 99])) for _ in range(n)]
        if n and rng.random() < 0.2:
            weights.append(weights[0])
            values.append(values[0])
            weights, values = weights[:5], values[:5]
        fixed.append((weights, values, rng.randint(0, 12)))
    return [unbounded_case(*c) for c in fixed]


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

    # Its own generator, so the sections above keep their values. Ties in the traceback are
    # where an implementation can drift: lcs_sequence moves up only on a strictly larger cell.
    lcs_rng = random.Random(20261121)
    lcs = [{"a": a, "b": b, "lcs": lcs_sequence(a, b)} for a, b in [("ABCBDAB", "BDCABA"), ("AGGTAB", "GXTXAYB"), ("ABC", "ACB"), ("AB", "BA"), ("AAA", "A"), ("A", "B")]]
    for _ in range(60):
        a = "".join(lcs_rng.choice("ABC") for _ in range(lcs_rng.randint(1, 12)))
        b = "".join(lcs_rng.choice("ABC") for _ in range(lcs_rng.randint(1, 12)))
        lcs.append({"a": a, "b": b, "lcs": lcs_sequence(a, b)})

    return [
        ("fibonacci", fib),
        ("climbing", stairs),
        ("coin", coins),
        ("lis", lis),
        ("kadane", kadane),
        ("edit", edit),
        ("mcm", mcm),
        ("lcs", lcs),
        ("unboundedKnapsack", unbounded_cases()),
    ]


def main():
    sections = make_sections()
    header = {
        "generator": "web/scripts/gen_dynamicProgramming_fixtures.py",
        "reference": "Algorithms/Dynamic_Programming (fibonacci, climbing_stairs, coin_change, lis, kadane, edit_distance, matrix_chain, lcs, unbounded_knapsack)",
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
