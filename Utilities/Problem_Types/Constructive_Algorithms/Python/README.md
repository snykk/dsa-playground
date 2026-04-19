# Constructive Algorithms — Python Implementation

**Constructive algorithms** don't search — they _build_ a valid answer directly from the input constraints. The challenge is spotting the pattern: "what structure automatically satisfies all the rules?"

For the conceptual overview, problem taxonomy, and worked examples, see the parent README: [../README.md](../README.md)

---

## Functions Included

| Function | What it constructs | Technique |
|----------|-------------------|-----------|
| `construct_permutation(n, k)` | A permutation of `[1..n]` with exactly `k` differing adjacent pairs | Pattern: alternate small/large until `k` is satisfied |
| `construct_array_with_sum(n, total, lo, hi)` | Array of `n` values summing to `total` with each in `[lo, hi]` | Fill greedy with `lo`, add remainder round-robin |
| `construct_graph(degrees)` | Simple graph matching a given degree sequence | Erdős–Gallai / Havel–Hakimi |
| `construct_string(n, a, b)` | String of length `n` with `a` A's and `b` B's | Interleave to avoid long runs |

---

## Python-Specific Notes

- **Generators for large outputs**: if the constructed object is huge, `yield` each element rather than materializing a list. Saves memory and lets callers stop early.
- **List comprehension beats loops**: `[f(i) for i in range(n)]` is both faster and clearer than `result = []; for i in range(n): result.append(f(i))`.
- **Feasibility first**: every constructor should return `None` (or raise) when the input is infeasible — e.g. "sum required exceeds `n * hi`". Silent bogus output is worse than an exception.
- **Immutable vs mutable output**: returning a `tuple` signals "don't modify this", returning a `list` signals "go ahead". Make the contract explicit.

---

## How to Run

```bash
python3 -m unittest constructive_algorithms_test.py
```

---

## Key Takeaways for Learners

1. **Spot the pattern, don't search.** Constructive problems reward pattern recognition over brute-force. A good warm-up: manually build a solution for small `n = 3, 4, 5` and look for the structure.
2. **Greedy + rule often wins.** Most constructive solutions follow "greedily fill; when a constraint tightens, adjust locally". Formalize your greedy rule before coding.
3. **Check feasibility at the boundary**. Constraints like `a + b == n` or `total ≤ n * hi` are usually the cutoff between "a solution exists" and "return impossible". Validate early.
