# DP Optimizations

Advanced techniques for speeding up dynamic programming transitions from O(n²) or worse to O(n log n) or even O(n) by exploiting structure in the cost function.

---

## Techniques

| Technique | Original DP | Optimized | When it applies |
|-----------|-------------|-----------|-----------------|
| **[Convex Hull Trick](Convex_Hull_Trick/)** | O(n²) transitions `dp[i] = min(m·x + b)` | O(n log n) or O(n) | Transitions look like a line query; slopes monotone |
| **Divide & Conquer DP** | O(n²) with opt(i) monotone | O(n log n) | `opt(i) ≤ opt(i+1)` (Knuth-Yao condition) |
| **Knuth's Optimization** | O(n³) over intervals | O(n²) | Quadrangle inequality holds |
| **SMAWK / Aliens Trick** | Various | Often O(n log V) | Minimization with convex structure |

This folder currently implements **Convex Hull Trick**. More optimizations coming as the project matures.

---

## When to Reach for DP Optimization

✅ **Good candidates:**
- Your DP is correct but TLE'ing
- The transition has linear-in-something structure
- Profiling shows the inner `min`/`max` loop dominates

❌ **Not worth it:**
- DP is already fast enough
- Cost function doesn't have the required structure (convexity, monotonicity)
- You can solve the problem with a different algorithm entirely

---

_Part of [Dynamic Programming](../README.md)._
