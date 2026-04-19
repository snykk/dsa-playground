# Convex Hull Trick (CHT) & Li Chao Tree

> A DP optimization that speeds up transitions of the form `dp[i] = min(m_j · x_i + b_j)` — "minimum of a bunch of linear functions at query point `x_i`" — from O(n) per query to **O(log n)** (Li Chao) or **O(1) amortized** (monotonic CHT).

---

## 🎯 Intuition

Many DPs look like this:
```
dp[i] = min over j < i of  (some_linear_function_of_j)(i)
      = min over j < i of  m_j · x_i + b_j
```

Each `j` contributes a **line** `y = m_j · x + b_j`. At query point `x = x_i`, we want the minimum `y` over all added lines.

The insight: the minimum over a collection of lines, as a function of `x`, is the **lower envelope** — a convex piecewise-linear function. Only the lines that appear on the lower envelope matter.

**Convex Hull Trick** maintains this lower envelope incrementally:
- Lines added in sorted-slope order → use a deque, O(1) amortized per insert and query.
- Lines in arbitrary order → use a **Li Chao Tree**, O(log n) per insert and query.

---

## 📊 Visual: Lower Envelope

Three lines:
```
y = 2x + 5     (steep, high intercept)
y = 1x + 3     (medium)
y = 0x + 7     (flat, high intercept)

          |
       7  ────────────────   ← y = 7 constant
          |  ╲
          |    ╲ (y=1x+3)
          |      ╲_____
          |             ╲___
          |_____________________
        Query at x = 0: min = 3  (line y=x+3)
        Query at x = 5: min = 7  (line y=7, it's now below y=x+3)
```

The **lower envelope** (the min at every x) is itself a convex piecewise-linear function. CHT maintains it as a structure you can query in O(log n) or O(1).

---

## 🧮 The Monotonic CHT (simple version)

Assumptions (for the O(1) amortized version):
- **Slopes added in monotonically decreasing order** (m₁ ≥ m₂ ≥ m₃ ≥ ...).
- **Query x's are monotonically non-decreasing**.

Data structure: a deque of `(slope, intercept)`.

### Insert a new line `(m, b)`
While the deque has ≥ 2 lines and the new line makes the **last** line redundant (the new line and the one before the last dominate it everywhere), pop the last line. Then push.

### Query `min(m·x + b)` at `x`
While the deque has ≥ 2 lines and the **first** line is dominated by the second at this `x`, pop the first line. Then return evaluation of the first.

Both amortized O(1) because each line is pushed and popped at most once.

---

## 🧮 Li Chao Tree (general version)

For arbitrary insertion order and arbitrary query order. Build a segment tree over the query-x range. Each node stores **one line** — the one that "wins" over the largest subrange of its interval.

### Insert `(m, b)` into a node covering `[lo, hi]`
1. Compare at midpoint. Keep whichever line is lower at mid.
2. Recurse into the side where the other line might still win.

### Query at `x`
Walk from root to the leaf containing `x`, tracking the minimum line value seen. O(log V) where V is the value range.

---

## ⏱️ Complexity

| Variant | Insert | Query | Restrictions |
|---------|--------|-------|--------------|
| **Monotonic CHT (deque)** | O(1) amortized | O(1) amortized | Slopes monotone; queries monotone |
| **CHT with binary search** | O(log n) | O(log n) | Slopes monotone; queries arbitrary |
| **Li Chao Tree** | O(log V) | O(log V) | None — arbitrary lines, arbitrary queries |
| **Li Chao Tree (dynamic)** | O(log² V) | O(log V) | Unknown value range; node allocation as needed |

`V` is the range of query points (e.g., `10^9` for typical CP constraints).

---

## 🎯 When to Use

✅ **Perfect fit:**
- DP of the form `dp[i] = min/max over j of (linear_in_i function of j)`
- Classic problems: **Batch scheduling, building skyscrapers, task partitioning with setup cost**
- Competitive programming problems tagged "DP optimization"

❌ **Not the right tool:**
- Cost function isn't linear in `i` → CHT doesn't apply; try Divide & Conquer DP or Knuth's opt
- DP is O(n) already — no benefit
- Only a few lines → just scan them each query

---

## ⚔️ CHT vs. Alternatives

| Technique | Good for | Not for |
|-----------|----------|---------|
| **Monotonic CHT** | Simplest case; slopes and queries monotone | Arbitrary orders |
| **Li Chao Tree** | Any order; fixed value range | Very wide value range without compression |
| **Dynamic Li Chao** | Any order, any range | Slight log² overhead |
| **Kinetic Segment Tree** | Dynamic insertions + deletions | Overkill for most CP problems |

For contest use: **start with monotonic CHT** if the problem allows it. Fall back to Li Chao only when slopes or queries aren't monotone.

---

## ⚠️ Common Pitfalls

1. **Min vs Max confusion.** Minimizing requires the **lower** envelope; maximizing the **upper**. The code differs in inequality direction. Don't try to unify — write two versions.
2. **Precision with doubles.** Intersection x-coordinates use division; rounding errors can cause lines to look wrongly dominated. For integer slopes and intercepts, use cross-multiplication: `(b1 - b2) * (m3 - m1) <= (b1 - b3) * (m2 - m1)` instead of `(b1 - b2) / (m2 - m1) <= (b1 - b3) / (m3 - m1)`.
3. **Overflow in cross-multiplication.** 64-bit slopes × 64-bit intercepts can overflow. Use `__int128` in C++, `big.Int` in Go, or plain Python (arbitrary precision).
4. **Equal slopes**: treat as "keep the one with lower intercept" for min. Forgetting this gives a deque full of parallel, mutually-dominating lines.
5. **Li Chao over unbounded range**: the naive implementation needs a fixed `[lo, hi]`. For queries over `[-10⁹, 10⁹]`, that's 2·10⁹ leaves — too much. Use coordinate compression or dynamic Li Chao.

---

## 🔧 Implementations

| Language | Folder | Notes |
|----------|--------|-------|
| Python | [Python/](Python/) | Deque-based monotonic CHT + Li Chao Tree |
| C++ | [C++/](C++/) | Deque-based CHT + Li Chao |
| Go | [Go/](Go/) | Slice-based CHT + Li Chao |

---

## 📝 Practice Problems

- [Codeforces 319C. Kalila and Dimna](https://codeforces.com/problemset/problem/319/C) — classic CHT introduction
- [Codeforces 631E. Product Sum](https://codeforces.com/problemset/problem/631/E) — CHT with slope tricks
- [SPOJ APIO10A. Commando](https://www.spoj.com/problems/APIO10A/) — textbook monotonic CHT
- [Atcoder DP Contest - Z. Frog 3](https://atcoder.jp/contests/dp/tasks/dp_z) — introductory CHT
- [Codeforces 932F. Escape Through Leaf](https://codeforces.com/problemset/problem/932/F) — CHT on a tree, needs Li Chao

---

## 🔗 Related

- [Segment Tree](../../../../Data%20Structures/Non_Linear/Trees/Segment%20Tree/README.md) — Li Chao builds on it
- [Dynamic Programming](../../README.md) — this is an optimization for specific DP shapes
- [Sliding Window](../../../../Problem_Patterns/Sliding%20Window/README.md) — different technique, different structure

---

_Part of [DP Optimizations](../README.md)._
