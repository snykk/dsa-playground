# Randomized Quickselect — Python Implementation

O(n) expected-time selection of the k-th smallest element via Lomuto partition with random pivot.

For the conceptual overview, complexity proof, and comparison with heap-based top-k, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `quickselect.py` | `quickselect(arr, k)` + `top_k_smallest(arr, k)` helpers |
| `quickselect_test.py` | 15 tests: ranks, duplicates, adversarial inputs, random cross-check against `sorted()` |

---

## Python-Specific Notes

- **Iterative inner loop** (`while lo < hi`) prevents recursion-depth issues on pathological inputs. Tail-recursion would be eliminated automatically in functional languages; Python doesn't, so explicit iteration is safer.
- **`rng.randint(lo, hi)` is inclusive on both ends** — different from `randrange(lo, hi)` which excludes `hi`. The `randint` form reads cleanly with inclusive partition bounds.
- **Mutates the input**: idiomatic for in-place algorithms but documented explicitly. `top_k_smallest` wraps `list(arr)` before mutation so callers don't get surprised.
- **No `heapq` dependency**: Python ships with `heapq.nsmallest` which beats Quickselect for small k (uses a heap internally, O(n log k)). For k comparable to n, Quickselect wins.
- **Inject RNG** for testability: every test passes `random.Random(seed)` for reproducibility. Production code can omit `rng` and use the module default.

---

## How to Run

```bash
python3 -m unittest quickselect_test.py
```

---

## Key Takeaways for Learners

1. **Quickselect recurses into _one_ side.** That's the entire difference from Quick Sort's two-sided recursion — and what drops the cost from O(n log n) to O(n) expected.
2. **Random pivot is the antifragility.** Without it, a sorted input with "first element" pivot gives O(n²). With it, no input distribution is systematically bad.
3. **`heapq.nsmallest` vs Quickselect**: for k ≪ n (top-10 out of a million), heap wins (O(n log k)). For k ≈ n/2 (median), Quickselect wins. Know both.
