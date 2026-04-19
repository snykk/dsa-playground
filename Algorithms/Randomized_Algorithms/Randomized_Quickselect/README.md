# Randomized Quickselect

> Given an array of `n` elements and an integer `k`, find the **k-th smallest element** in **O(n) expected time** — faster than sorting (O(n log n)) and simpler than the deterministic median-of-medians algorithm. Powers `std::nth_element` and countless "top-k" pipelines.

---

## 🎯 Intuition

You need the median of a million numbers. Sorting takes O(n log n). But the median is a single element — do you really need everything sorted?

**Quickselect's insight:** Quick Sort's partition step tells you _exactly_ where your pivot lands in the sorted order. If the pivot ends up at index `k`, you're done — you've found the k-th smallest without sorting anything else.

```
After partition around pivot p:
    [<= p] p [>= p]
     ↑
     If k lies in this range, recurse left.
     If k lies in [>= p] range, recurse right.
     If k == position of p, return p.
```

You only recurse into **one** side (not both, like Quick Sort). That's what drops the expected cost from O(n log n) to O(n).

Random pivot choice is what makes it O(n) _expected_ regardless of input. Deterministic "first element" pivot on a sorted array gives O(n²) — randomization saves the day.

---

## 📊 Visual

Find the 3rd smallest (0-indexed k=2) in `[7, 2, 1, 8, 6, 3, 5, 4]`:

```
Array: [7, 2, 1, 8, 6, 3, 5, 4], target k=2
Random pivot: 5 (index 6)
Partition:    [2, 1, 3, 4] 5 [7, 8, 6]
                           ^ pivot lands at index 4
              k=2 < 4, recurse left half [2, 1, 3, 4]

Sub-array: [2, 1, 3, 4], target k=2 (unchanged)
Random pivot: 3
Partition:   [2, 1] 3 [4]
                    ^ pivot at index 2
             k=2 == 2 → return 3
```

Answer: the 3rd smallest is `3`.

---

## 🧮 Algorithm

```
function quickselect(arr, lo, hi, k):
    if lo == hi:
        return arr[lo]
    pivot_idx = partition(arr, lo, hi, random_index(lo, hi))
    if k == pivot_idx:
        return arr[k]
    elif k < pivot_idx:
        return quickselect(arr, lo, pivot_idx - 1, k)
    else:
        return quickselect(arr, pivot_idx + 1, hi, k)

function partition(arr, lo, hi, pivot_idx):
    # Lomuto partition: move pivot to end, then one pass
    swap arr[pivot_idx], arr[hi]
    pivot = arr[hi]
    store = lo
    for i from lo to hi-1:
        if arr[i] < pivot:
            swap arr[i], arr[store]
            store += 1
    swap arr[store], arr[hi]
    return store
```

Iterative version: replace recursion with a loop that updates `lo` / `hi`. Same O(n) expected cost, O(1) stack.

---

## ⏱️ Complexity — and Why

| Aspect | Bound | Proof sketch |
|--------|-------|--------------|
| **Expected time** | **O(n)** | Random pivot splits roughly evenly on average; recurrence T(n) ≈ T(n/2) + O(n) = O(n) |
| Worst-case time | O(n²) | Adversarial pivot (always min or max); vanishingly rare with random pivot |
| Space | O(log n) expected (recursion) / O(1) iterative | |
| In place? | Yes | Only swaps inside the input array |

The expected-O(n) proof: with random pivot, the expected partition splits into `i` and `n - i - 1` with each `i` equally likely. Solving `E[T(n)] = E[T(max(i, n-i-1))] + O(n)` by summing gives `E[T(n)] ≤ 4n`.

---

## 🎯 When to Use

✅ **Use Quickselect when:**
- You need the k-th smallest / largest (median, percentile)
- You need the top-k elements (use `std::nth_element` + slice)
- Sorting-then-indexing is too expensive
- Data fits in memory

❌ **Don't use when:**
- You need _all_ elements sorted → just sort
- Data doesn't fit in memory → use heap-based top-k or external sort
- You need a deterministic worst-case O(n) → use [median-of-medians](https://en.wikipedia.org/wiki/Median_of_medians)
- Pivoting is against adversarial input in a security context — randomized means attacker can't predict your choice, but if they can observe your RNG seed, all bets are off

---

## ⚔️ Quickselect vs. Alternatives

| Algorithm | Time | Space | Notes |
|-----------|------|-------|-------|
| **Randomized Quickselect** | O(n) expected | O(log n) / O(1) | Simple, fast in practice |
| **Median-of-medians (deterministic)** | O(n) worst | O(log n) | Provably O(n), 5-10× slower constant |
| **Heap-based top-k** | O(n log k) | O(k) | Better when k ≪ n and memory matters |
| **Sort then index** | O(n log n) | O(log n) | Simplest; OK if all-ordered output is needed |
| **Introselect (std::nth_element)** | O(n) worst | O(log n) | Hybrid: Quickselect + fallback to median-of-medians |

---

## ⚠️ Common Pitfalls

1. **Fixed pivot on sorted input = O(n²).** Always use `rng.randint(lo, hi)` — first-element or last-element pivots are classic footguns.
2. **Recursing into both sides is Quick Sort, not Quickselect.** Quickselect recurses into _one_ side only. Missing this turns O(n) into O(n log n).
3. **Off-by-one on `k`.** Agree with yourself on 0-indexed or 1-indexed k upfront. 0-indexed is more common in stdlib APIs; 1-indexed is more common in math textbooks.
4. **In-place mutation.** Quickselect rearranges the input. If the caller needs the original, copy first (`arr.copy()` / `std::vector<int>(arr)` / `append([]int(nil), arr...)`).
5. **Returning the pivot value vs the k-th element** — these coincide when pivot lands at k, but the function's job is to return the k-th element, which may be on the recursive side.

---

## 🔧 Implementations

| Language | Folder | Notes |
|----------|--------|-------|
| Python | [Python/](Python/) | Recursive; uses `random.Random` for determinism in tests |
| C++ | [C++/](C++/) | Iterative + comparison with `std::nth_element` |
| Go | [Go/](Go/) | Recursive with per-instance `*rand.Rand` |

---

## 📝 Practice Problems

- [LeetCode 215. Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/) — canonical quickselect problem
- [LeetCode 973. K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/)
- [LeetCode 347. Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)
- [LeetCode 324. Wiggle Sort II](https://leetcode.com/problems/wiggle-sort-ii/) — uses quickselect for the median

---

## 🔗 Related

- [Quick Sort](../../Sorting/Quick%20Sort/README.md) — sibling using the same partition primitive
- [Reservoir Sampling](../Reservoir_Sampling/README.md) — another "randomization buys simplicity" pattern
- [Randomized Algorithms overview](../README.md)

---

_Part of [Randomized Algorithms](../README.md)._
