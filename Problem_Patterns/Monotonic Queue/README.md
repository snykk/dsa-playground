# Monotonic Queue Pattern

> A **Monotonic Queue** is a **deque** where we maintain elements in monotonic (non-increasing or non-decreasing) order from front to back. It supports O(1) access to the maximum (or minimum) of the current window, making it the canonical tool for **sliding window maximum / minimum** problems.

---

## 🎯 Intuition

Imagine a line of people arranged by height. New person comes from the right:
- If they're taller than the person at the back, the shorter ones can leave — they'll never be the tallest _visible_ again while the taller newcomer is in line.
- The front of the line always holds the tallest currently-in-view person.

That's the essence of a monotonic decreasing deque: **when a bigger element comes in, pop all smaller elements from the back first**. The front is always the max.

For minimum, flip: pop all _larger_ elements from the back.

This generalizes the **Monotonic Stack** (one-direction) to a **Monotonic Deque** (window with both ends). Think of it as: _"monotonic stack, but the front can also leave when it slides out of the window."_

---

## 📊 Visual: Sliding Window Max

Array `[1, 3, -1, -3, 5, 3, 6, 7]`, window size `k = 3`.

```
Window        Deque (indices, values shown)   Max at front
[1]           [1]                             1
[1,3]         [3]       (popped 1, too small) 3
[1,3,-1]      [3,-1]                          3
[3,-1,-3]     [3,-1,-3] (1 slides out; 3 still at front) 3
[-1,-3,5]     [5]       (popped all; 5 biggest) 5
[-3,5,3]      [5,3]                            5
[5,3,6]       [6]       (popped 5 and 3)       6
[3,6,7]       [7]       (popped 6)             7

Output: [3, 3, 3, 5, 5, 6, 7]
```

Every element enters and leaves the deque at most once → **O(n) total** across all windows, not O(n·k) as brute force would be.

---

## 🧮 Algorithm

For **sliding window maximum** with window size `k` over array `arr`:

```
dq = empty deque (stores indices)
result = []
for i in range(n):
    # 1. Remove indices that fall out of the window
    while dq and dq.front() <= i - k:
        dq.popleft()
    # 2. Maintain decreasing order at the back
    while dq and arr[dq.back()] <= arr[i]:
        dq.pop()
    # 3. Push current index
    dq.append(i)
    # 4. Once we have a full window, record the max
    if i >= k - 1:
        result.append(arr[dq.front()])
return result
```

Three invariants:
1. **All indices in the deque are inside the current window.**
2. **Values at those indices are strictly decreasing from front to back.**
3. **Front is the current window maximum.**

---

## 🚶 Step-by-Step Walkthrough

Array `[3, 1, -1, 2]`, `k = 2`.

```
i=0, arr=3
  Step 1: deque empty — nothing to pop
  Step 2: deque empty — nothing to pop
  Step 3: push 0 → dq=[0]
  Step 4: i < k-1=1 → no output

i=1, arr=1
  Step 1: front=0, 0 > 1-2=-1 → keep
  Step 2: arr[back=0]=3 > 1 → don't pop
  Step 3: push 1 → dq=[0,1] (values 3, 1: decreasing ✓)
  Step 4: i=1, window [3,1], max=arr[0]=3 → output 3

i=2, arr=-1
  Step 1: front=0, 0 > 0 false → 0 <= 2-2=0 → pop! dq=[1]
  Step 2: arr[back=1]=1 > -1 → don't pop
  Step 3: push 2 → dq=[1,2] (values 1, -1: decreasing ✓)
  Step 4: output arr[1]=1

i=3, arr=2
  Step 1: front=1, 1 > 3-2=1 false → 1 <= 1 → pop! dq=[2]
  Step 2: arr[back=2]=-1 <= 2 → pop! dq=[]
  Step 3: push 3 → dq=[3]
  Step 4: output arr[3]=2

Output: [3, 1, 2]
```

---

## ⏱️ Complexity — and Why

| Metric | Value | Explanation |
|--------|-------|-------------|
| **Time** | O(n) | Each index pushed and popped at most once across the entire scan |
| **Space** | O(k) | Deque holds at most `k` indices |

The amortized argument is the same as monotonic stack: total work across the inner `while` loops is bounded by total push count, which is `n`.

---

## 🎯 When to Use

✅ **Perfect fit:**
- Sliding window maximum / minimum — the canonical use case
- "What's the best we could do starting from each position with limit k?"
- DP optimization when transitions reference the min/max of a sliding range
- Constrained subarray problems (e.g., "longest subarray with max - min ≤ k")

❌ **Not the right tool:**
- Static range max/min (no window movement) → use **Sparse Table** or **Segment Tree**
- You need arbitrary range queries, not just sliding → use **Segment Tree**
- You need the k-th largest — monotonic queue only tracks the extreme

---

## ⚔️ Monotonic Queue vs. Alternatives

| Technique | Best for | Time |
|-----------|----------|------|
| **Monotonic Queue** | Sliding window min/max | O(n) total |
| **Multiset / Balanced BST** | Sliding window, any rank query | O(n log k) |
| **Segment Tree** | Any range, any query | O(n log n) build + O(log n) per query |
| **Heap + lazy deletion** | Sliding window max | O(n log k) |
| **Sparse Table** | Static range max/min | O(n log n) build, O(1) per query |

Monotonic queue **wins on speed** when you only need the extreme and the window slides uniformly.

---

## ⚠️ Common Pitfalls

1. **Storing values, not indices.** You need indices to know when something slides out of the window. Storing only values works for one-shot max but loses window awareness.
2. **`<=` vs `<` for the back-pop condition.** Use `<=` (strict decreasing isn't required) — otherwise equal values force extra work. Both are correct; `<=` is more cache-friendly in practice.
3. **Forgetting the window-expiration check.** Step 1 of the loop must run _before_ step 4 emits the answer. Otherwise you may output a value that's no longer in the window.
4. **Output only after the window fills.** For the first `k-1` iterations, the window isn't full — no output. Off-by-one here is a classic bug.
5. **Deque vs. stack confusion.** Monotonic _stack_ is push/pop at one end. Monotonic _queue_ needs both ends — hence `deque`, not `stack`.

---

## 🔗 Related Patterns

- [Monotonic Stack](../Monotonic%20Stack/README.md) — the one-ended ancestor
- [Sliding Window](../Sliding%20Window/README.md) — the window-management pattern; monotonic queue is the optimization inside
- [Two Pointers](../Two%20Pointers/README.md) — similar spirit, different mechanics

---

## 🔧 Implementations

| Language | Folder | Notes |
|----------|--------|-------|
| Python | [Python/](Python/) | `collections.deque`-based with sliding-window max/min helpers |
| C++ | [C++/](C++/) | `std::deque<int>`-based |
| Go | [Go/](Go/) | Slice-based deque (front-pop via index head, back-push/pop via slice) |

---

## 📝 Practice Problems

- [LeetCode 239. Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/) — the canonical problem
- [LeetCode 862. Shortest Subarray with Sum at Least K](https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/) — monotonic queue on prefix sums
- [LeetCode 918. Maximum Sum Circular Subarray](https://leetcode.com/problems/maximum-sum-circular-subarray/) — sliding max after unrolling
- [LeetCode 1499. Max Value of Equation](https://leetcode.com/problems/max-value-of-equation/) — sliding window with constraint
- [Codeforces 372C. Watching Fireworks is Fun](https://codeforces.com/problemset/problem/372/C) — monotonic queue DP optimization

---

_Part of [Problem Patterns](../README.md)._
