# 0/1 Knapsack Problem

> Given `n` items, each with a **weight** and a **value**, and a knapsack of capacity `W`, choose a subset of items to maximize total value **without exceeding the capacity**. You can take each item **at most once** (0 or 1 — hence the name).

---

## 🎯 Intuition

You're a burglar. Your bag holds 10 kg. On the floor are a laptop (3 kg, $1000), a TV (8 kg, $1200), and a watch (1 kg, $500). What do you grab?

- Take laptop + TV? Weight 11 kg — over capacity. ❌
- Take laptop + watch? Weight 4 kg, value $1500. ✅
- Take TV + watch? Weight 9 kg, value $1700. ✅ — **optimal!**

The 0/1 in the name means: **each item is either fully taken or left behind.** You can't take half a TV. That's the constraint that makes greedy ("always grab the highest value-per-weight") fail — unlike its sibling the _fractional_ knapsack.

---

## 🧮 Recurrence

Let `dp[i][w]` = maximum value using items `1..i` with a capacity of `w`.

**Base case:** `dp[0][w] = 0` for all `w` (zero items → zero value).

**Transition:** for each item `i` (weight `wi`, value `vi`):
```
If wi > w:                              (item too heavy — can't fit)
    dp[i][w] = dp[i-1][w]
Else:
    dp[i][w] = max(
        dp[i-1][w],                     (skip item i)
        dp[i-1][w - wi] + vi            (take item i)
    )
```

**Answer:** `dp[n][W]`.

The key move is the `max` of "skip" and "take". Greedy can't make that decision locally — DP explores both and picks the winner.

---

## 📊 Visual: Filling the DP Grid

Items: `(w=2, v=3)`, `(w=3, v=4)`, `(w=4, v=5)`, `(w=5, v=6)`. Capacity `W=5`.

```
         w=0  w=1  w=2  w=3  w=4  w=5
  i=0     0    0    0    0    0    0     (no items)
  i=1     0    0    3    3    3    3     (item 1: w=2, v=3)
  i=2     0    0    3    4    4    7     (item 2: w=3, v=4 → best: 3+4)
  i=3     0    0    3    4    5    7     (item 3: w=4, v=5 — can't beat 3+4)
  i=4     0    0    3    4    5    7     (item 4: w=5, v=6 — just fits, but 7 is better)
```

Answer: `dp[4][5] = 7` (items 1 + 2, total weight 5, total value 7).

---

## 🚶 Step-by-Step Trace

For cell `dp[2][5]` (items 1 & 2, capacity 5, item 2 has `w=3, v=4`):
- **Skip item 2:** `dp[1][5] = 3` (just item 1)
- **Take item 2:** `dp[1][5-3] + 4 = dp[1][2] + 4 = 3 + 4 = 7`
- **max(3, 7) = 7.** ✅

For cell `dp[3][4]` (add item 3 with `w=4, v=5`):
- **Skip:** `dp[2][4] = 4`
- **Take:** `dp[2][0] + 5 = 0 + 5 = 5`
- **max(4, 5) = 5.** We choose to take item 3.

The DP explores both branches for every cell — that's what guarantees optimality.

---

## ⏱️ Complexity — and Why

| Approach | Time | Space | Why |
|----------|------|-------|-----|
| Recursion (no memo) | O(2^n) | O(n) stack | Each item branches into take/skip |
| Top-down DP | O(n·W) | O(n·W) | Each subproblem solved once |
| Bottom-up 2D | O(n·W) | O(n·W) | Classic table |
| **Bottom-up 1D** | **O(n·W)** | **O(W)** | Iterate `w` from `W` down to `wi` to avoid reusing item |

Time is **pseudo-polynomial**: it's polynomial in `n` and `W`, but `W` is an input _value_, not size. If `W = 10⁹`, the DP is infeasible even though `n = 20` — you'd need meet-in-the-middle or branch-and-bound instead.

---

## 🎯 When to Use 0/1 Knapsack

✅ **Use 0/1 Knapsack when:**
- Items are **indivisible** (one or none)
- Capacity `W` is reasonable (say ≤ 10⁵ for `n ≤ 10³`)
- You need the **optimal** subset, not approximate

❌ **Don't use when:**
- Items are divisible → use **Fractional Knapsack** (greedy, O(n log n))
- Unlimited copies of each item allowed → use **Unbounded Knapsack**
- `W` is huge (10⁹+) → use branch-and-bound or MITM
- You only need approximate answer → FPTAS gives (1-ε) approximation in poly time

---

## ⚔️ 0/1 Knapsack vs. Greedy: Why Greedy Fails

Consider items with value-per-weight:
- A: w=10, v=60 → ratio 6.0
- B: w=20, v=100 → ratio 5.0
- C: w=30, v=120 → ratio 4.0

Capacity 50. **Greedy by ratio:** pick A (leftover 40), then B (leftover 20), can't fit C. Total value: **160**.

**Actual optimal:** skip A, take B and C. Weight 50, value **220**.

Greedy was tricked by high ratio on a small item. DP examines every subset-space combination.

Fractional knapsack doesn't have this problem — you can take 20/30 of C — which is why greedy works there.

---

## ⚠️ Common Pitfalls

1. **1D optimization: loop `w` in the wrong direction.** You MUST iterate `w` from `W` down to `wi`. Going forward reuses the same item multiple times (that's the unbounded knapsack bug).
2. **Off-by-one**: `dp[i][w]` has `n+1` rows (for `i = 0..n`) and `W+1` columns. Forgetting the extra row/column gives "index out of range" at the boundary.
3. **Confusing `dp[i-1][w]` vs `dp[i][w]` in the 1D optimization**: in 1D, `dp[w]` at the time you read it is the "previous" row. Overwriting from left-to-right breaks this; right-to-left preserves it.
4. **Weights or values that are 0**: edge case — `w_i = 0` means "always take for free". Some implementations break.
5. **Large `W`**: DP is `O(n·W)`. If `W = 10⁹`, this is infeasible. Switch to meet-in-the-middle (`O(2^(n/2))`).

---

## 🔀 Variants Worth Knowing

| Variant | Constraint | Algorithm |
|---------|-----------|-----------|
| **Fractional Knapsack** | Items divisible | Greedy by v/w ratio, O(n log n) |
| **Unbounded Knapsack** | Unlimited copies | Same DP, forward loop |
| **Bounded Knapsack** | Up to k copies of each item | Binary representation trick → 0/1 knapsack |
| **Multi-dimensional** | Weight + volume + ... | DP with extra dimension |
| **Subset Sum** | Values = weights, ask "can we hit exactly S?" | Boolean DP |

---

## 🔧 Implementations

| Language | Folder | Notes |
|----------|--------|-------|
| Python | [Python/](Python/) | Bottom-up 2D + 1D space-optimized + traceback to recover items |
| C++ | [C++/](C++/) | 2D table + 1D optimization |
| Go | [Go/](Go/) | Bottom-up with clean table and returned value |

---

## 📝 Practice Problems

- [LeetCode 416. Partition Equal Subset Sum](https://leetcode.com/problems/partition-equal-subset-sum/) — subset sum = 0/1 knapsack with `vi = wi`
- [LeetCode 494. Target Sum](https://leetcode.com/problems/target-sum/) — reduces to subset sum
- [LeetCode 474. Ones and Zeroes](https://leetcode.com/problems/ones-and-zeroes/) — 2D knapsack
- [Codeforces 189A. Cut Ribbon](https://codeforces.com/problemset/problem/189/A) — unbounded knapsack
- [SPOJ KNAPSACK](https://www.spoj.com/problems/KNAPSACK/) — classic

---

_Part of the [Dynamic Programming](../../README.md) section._
