# Segment Tree (Lazy Propagation)

A lazy segment tree gives every node a pending-update tag, so adding a value to a whole range costs O(log n) instead of one update per element. A tag waits on a fully covered node and is pushed to its children only when a later operation has to look inside. This repository supports range add and range sum.

## Intuition

A plain segment tree answers range sums quickly but updates one element at a time. To add 3 to a range, notice that for a node whose segment is *entirely* inside the range, the new sum is known at once: `sum += 3 * length`. Nobody needs the children's exact values yet, so write "+3 per element, still owed" on the node (the tag) and stop. When a later query or update must descend through that node, first pass the tag to both children (the push-down) and clear it.

Invariant: a node's sum is correct as long as none of its ancestors holds a tag, and a tag on a node means every element below it still owes that amount. Tags only rest on fully covered nodes.

The tree is recursive: root = node 1 over `[0, n - 1]`, node `[s, e]` splits at `mid = (s + e) / 2`, children `2 * node` and `2 * node + 1`, arrays of `4n` cells.

## Visual

After `update_range(1, 4, +3)` on `[1, 3, 5, 7, 9, 11]` (sum 36). Tags rest on the maximal fully covered nodes `[1]`, `[2]` and `[3-4]`:

```text
                     [0-5] sum 48
                /                    \
        [0-2] sum 15                [3-5] sum 33
        /          \                /          \
  [0-1] sum 7   [2-2] 8 (+3)  [3-4] 22 (+3)   [5-5] 11
    /      \                     /       \
[0-0] 1  [1-1] 6 (+3)       [3-3] 7     [4-4] 9     <- stale until pushed
```

## Operations

| Operation | What it does | Time |
| --------- | ------------ | ---- |
| build | recursive; sums only, all tags zero | O(n) |
| `update_range(l, r, v)` | add `v` to every element of `l..r` (inclusive, 0-based) | O(log n) |
| `query(l, r)` | sum of elements `l..r` (inclusive) | O(log n) |

There is no point assignment and no index validation: a range partly outside the array is clipped by the recursion, and one wholly outside does nothing.

### Update

At node `[s, e]`:

1. No overlap (`r < s` or `e < l`): return.
2. Full cover (`l <= s` and `e <= r`): `tree[node] += v * (e - s + 1)`, `lazy[node] += v`, return.
3. Partial: push down, recurse into both children, then `tree[node] = tree[2*node] + tree[2*node+1]`.

### Query

Same three cases: return 0, return the node's sum, or push down and add the two children's answers.

### Push-down

If `lazy[node] != 0`: add `lazy[node] * (child length)` to each child's sum, add `lazy[node]` to each child's tag, set `lazy[node] = 0`. The two children may have different lengths.

## Step-by-Step Trace

Array `[1, 3, 5, 7, 9, 11]`, then `update_range(1, 4, 3)`:

| Node | Overlap | Action |
| ---- | ------- | ------ |
| `[0-5]` | partial | push (no tag), recurse |
| `[0-2]` | partial | recurse |
| `[0-1]` | partial | recurse |
| `[0-0]` | none | return |
| `[1-1]` | full | sum 3 + 3 = 6, tag +3 |
| `[2-2]` | full | sum 5 + 3 = 8, tag +3 |
| `[3-5]` | partial | recurse |
| `[3-4]` | full | sum 16 + 3 * 2 = 22, tag +3 |
| `[5-5]` | none | return |

Rebuilding the partial nodes bottom-up gives `[0-1]` = 7, `[0-2]` = 15, `[3-5]` = 33 and the root 48.

Then `query(3, 3)` descends `[0-5]`, `[3-5]`, `[3-4]`. At `[3-4]` it pushes the tag: `[3-3]` gets sum 7 + 3 = 10 and tag +3, `[4-4]` gets 9 + 3 = 12 and tag +3, and `[3-4]` is cleared. The answer is 10. (All numbers were produced by running the Python implementation.)

## Complexity

| Operation | Time | Why |
| --------- | ---- | --- |
| build | O(n) | each node created once |
| update_range, query | O(log n) | at most 4 nodes per level: two partial and up to two fully covered |
| space | O(n) | two arrays of `4n` |

Without lazy tags a range add costs O(n log n): one point update per element.

## When to Use

- Many range adds interleaved with range sums.
- Variants with range assign, flip or min/max need different tags; only range add with range sum is implemented here.
- If every update is a range add and every query a range sum, two [Fenwick Tree](../Fenwick_Tree/README.md)s are shorter. If updates are point updates, the plain [Segment Tree](../Segment_Tree/README.md) is enough.

## Lazy Segment Tree vs. Alternatives

| Structure | Range update | Range query | Notes |
| --------- | ------------ | ----------- | ----- |
| Lazy segment tree | O(log n) | O(log n) | general, most code |
| Plain segment tree | O(n log n) per range | O(log n) | point updates only |
| Two Fenwick trees | O(log n) | O(log n) | add and sum only |
| Difference array | O(1) | O(n) to rebuild | offline use |

## Common Pitfalls

- Not pushing down before recursing into a partially covered node.
- Using `v` instead of `v * length` for a sum, or scaling by the wrong child's length in the push-down.
- Putting tags on partially covered nodes.
- Not recomputing the parent after recursing.
- Mixing assignment and addition tags without a composition rule.
- Overflow of `value * length`: C++ and Go use 64-bit integers here; Python is unbounded.

## Implementations

| Language | Folder | Main file | Notes |
| -------- | ------ | --------- | ----- |
| Python | `Python/` | `segment_tree_lazy.py` | `update_range`, `query`; unbounded integers |
| C++ | `C++/` | `segment_tree_lazy.cpp` | `updateRange`, `query`; `long long` |
| Go | `Go/` | `main.go` | `UpdateRange`, `Query`; `int64` |

## Practice Problems

- [LeetCode 307: Range Sum Query - Mutable](https://leetcode.com/problems/range-sum-query-mutable/) (point updates; start with the plain tree)
- [LeetCode 699: Falling Squares](https://leetcode.com/problems/falling-squares/) (range assign and range max)
- [LeetCode 218: The Skyline Problem](https://leetcode.com/problems/the-skyline-problem/)
- Add range assignment and write the tag composition rule.

## Related

- [Segment Tree](../Segment_Tree/README.md)
- [Fenwick Tree](../Fenwick_Tree/README.md)
- [Sparse Table](../Sparse_Table/README.md)
