# Cartesian Tree

A Cartesian tree turns an array into a binary tree that is a min heap by value and returns the original array when read in-order. It is built in O(n) with a stack, and the minimum of any range is the lowest common ancestor (LCA) of the range's two ends.

## Intuition

Two rules pin the tree down. Reading in-order must give the array back, so everything left of a node in the array lies in its left subtree. And every node is `<=` its children, so the root must be the array minimum. Pick the minimum as the root, then solve the part to its left and the part to its right the same way.

**Invariant:** in-order = original array, and parent `<=` child. For ties, a later equal value becomes a descendant of the earlier one, so the leftmost minimum is the ancestor.

A treap is exactly the Cartesian tree of its keys (sorted) with random priorities as the values.

## Visual

```text
array: 9 3 7 1 8 12 10 20 15 18 5      index 0..10

                 1
              /     \
            3         5
          /   \      /
         9     7    8
                      \
                       10
                      /  \
                    12    15
                         /  \
                       20    18

RMQ(4, 8): root 1 (index 3 < 4) -> right; 5 (index 10 > 8) -> left;
           8 (index 4 in [4, 8]) -> answer: index 4, value 8
```

## How It Works / Operations

Build with a stack that holds the right spine. For each value `v`, left to right:

1. Pop while the top is strictly greater than `v`; remember the last popped node.
2. The last popped node becomes the left child of the new node.
3. If the stack is not empty, the new node becomes the right child of the top.
4. Push the new node. The root is the bottom of the stack.

| Operation | Description | Time |
|-----------|-------------|------|
| build | stack construction | O(n) |
| `get_min_index(l, r)` | walk from the root: go right if the node index is below `l`, left if above `r`, otherwise it is the answer (leftmost minimum); -1 for an empty tree or an invalid range | O(h) |
| traversals | in-order returns the original array | O(n) |
| `height()`, `size()`, `is_empty()` | shape information (height in edges, empty = -1) | O(n), O(n), O(1) |

## Step-by-Step Trace

Stack (values, bottom to top) while building `[9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5]`:

| Read | Popped | Stack after |
|------|--------|-------------|
| 9 | none | 9 |
| 3 | 9 | 3 |
| 7 | none | 3, 7 |
| 1 | 7, 3 | 1 |
| 8 | none | 1, 8 |
| 12 | none | 1, 8, 12 |
| 10 | 12 | 1, 8, 10 |
| 20 | none | 1, 8, 10, 20 |
| 15 | 20 | 1, 8, 10, 15 |
| 18 | none | 1, 8, 10, 15, 18 |
| 5 | 18, 15, 10, 8 | 1, 5 |

Queries (checked against the code): `[0, 2]` gives index 1 (value 3), `[4, 8]` gives index 4 (value 8), `[5, 9]` gives index 6 (value 10), `[6, 10]` gives index 10 (value 5).

## Complexity

| Operation | Time | Why |
|-----------|------|-----|
| build | O(n) | each element is pushed and popped at most once |
| range minimum | O(h) | one root-to-LCA path |
| traversals, size, height | O(n) | every node visited |

h is O(log n) for random data but n - 1 for sorted input (a chain). Space is O(n) for the nodes plus a copy of the array. For O(1) queries, compute the LCA with an Euler tour and a sparse table; this code does not.

## When to Use

Use it for static range-minimum queries when you also want the tree structure (LCA, treaps, nearest-smaller-element problems). Avoid it when values change often (use a segment tree) or when you need worst-case O(1) queries on sorted-like data (use a sparse table).

## Cartesian Tree vs. Alternatives

| Structure | Build | Query | Notes |
|-----------|-------|-------|-------|
| Cartesian tree (this code) | O(n) | O(h) | static |
| [Sparse Table](../Sparse%20Table/README.md) | O(n log n) | O(1) | static, more memory |
| [Segment Tree](../Segment%20Tree/README.md) | O(n) | O(log n) | supports updates |
| Scan the range | none | O(n) | fine for few queries |

## Common Pitfalls

- Searching both children after a node is already inside the range; by heap order it is already the minimum of its subtree.
- Popping on `>=` instead of `>`: this changes the tie-breaking. This code returns the leftmost minimum.
- Recursing on sorted input: the tree is a chain, so recursive traversal or destruction overflows the stack (the Python and C++ versions here are iterative).
- Assuming the tree is balanced.
- Quoting O(log n) per query: it is O(h) here.

## Implementations

- [Python](Python/README.md)
- [C++](C++/README.md)
- [Go](Go/README.md)

## Practice Problems

- LeetCode 654, Maximum Binary Tree (the max version of this tree).
- LeetCode 84, Largest Rectangle in Histogram (same stack idea).
- LeetCode 239, Sliding Window Maximum (related monotonic structure).

## Related

- [Treap](../Treap/README.md): the Cartesian tree of (key, priority) pairs.
- [Sparse Table](../Sparse%20Table/README.md): O(1) static range minimum.
- [Segment Tree](../Segment%20Tree/README.md): range queries with updates.
- [Binary Tree](../Binary%20Tree/README.md): the underlying shape.
- [Min Heap](../../Heaps/Min%20Heap/README.md): the same ordering rule, but position-free.
