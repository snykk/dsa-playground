# Min Heap

A min heap is a complete binary tree stored in an array in which every parent is `<=` its children, so the smallest element is always at index 0. Peek is O(1), insert and extract are O(log n), and building from an array is O(n).

## Intuition

Think of a tournament bracket where only the winner matters: the heap does not rank everyone, it only guarantees that each parent beats its children. That partial order is cheap to repair. A change touches one root-to-leaf path, of length about log2(n).

Two rules make it work:

- **Shape:** the tree is complete (every level full except the last, which fills from the left), so it fits in an array with no gaps.
- **Order:** parent `<=` children. Siblings are not ordered.

## Visual

```text
Array [1, 3, 2, 5, 9, 8, 7]   (index i: children 2i+1 and 2i+2, parent (i-1)/2)

        1
       / \
      3   2
     / \ / \
    5  9 8  7
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `peek()` | return the root | O(1) |
| `insert(x)` | append, then sift up while the parent is out of order | O(log n) |
| `extract_min()` | return the root, move the last element to the root, sift down by swapping with the smaller child | O(log n) |
| constructor from array | bottom-up heapify from index `n / 2 - 1` to 0 | O(n) |
| `size()`, `is_empty()`, `clear()` | bookkeeping | O(1) |

Empty heap: `peek` and `extract_min` raise `IndexError` in Python, throw `std::runtime_error` in C++ and panic in Go.

## Step-by-Step Trace

Insert `1` into `[3, 5, 8]`, then extract the minimum from `[1, 3, 2, 5, 9, 8]`:

| Step | Array | What happens |
| --- | --- | --- |
| append 1 | `[3, 5, 8, 1]` | index 3, parent index 1 holds 5 > 1 |
| swap | `[3, 1, 8, 5]` | parent index 0 holds 3 > 1 |
| swap | `[1, 3, 8, 5]` | reached the root, stop |
| extract: move last to root | `[8, 3, 2, 5, 9]` | return 1; children of 8 are 3 and 2 |
| swap with smaller child | `[2, 3, 8, 5, 9]` | 8 has no children left, stop |

## Complexity

| Operation | Time | Why |
| --- | --- | --- |
| peek | O(1) | the root is index 0 |
| insert | O(log n) | at most one swap per level climbed |
| extract_min | O(log n) | at most one swap per level descended |
| build from array | O(n) | at most n / 2^(h+1) nodes have height h and sink at most h levels, so the sum n * (sum h / 2^(h+1)) is O(n) |
| search for a value | O(n) | no order between siblings |

Space is O(n) for the array; the operations are iterative, so there is no recursion stack. Building by n inserts instead costs O(n log n).

## When to Use

- Use it when you repeatedly need the smallest item: schedulers, event simulation, Dijkstra, Prim, merging k sorted lists.
- To keep the k **largest** of a stream, hold a min heap of size k and pop whenever it grows past k (O(n log k)).
- Do not use it when you need sorted iteration, arbitrary search or priority updates; use a balanced tree or an indexed heap.

## Min Heap vs. Alternatives

| Structure | Peek | Insert | Remove top | Notes |
| --- | --- | --- | --- | --- |
| Min heap | O(1) | O(log n) | O(log n) | compact array |
| Sorted array | O(1) | O(n) | O(1) | inserts shift elements |
| Unsorted array | O(n) | O(1) | O(n) | cheap only if you rarely query |
| Balanced BST | O(log n) | O(log n) | O(log n) | also sorted iteration and search |
| Max heap | - | - | - | mirror image, see [Max Heap](../Max_Heap/) |

Heap sort uses a **max** heap, see [Heap Sort](../../../../Algorithms/Sorting/Heap_Sort/).

## Common Pitfalls

- Swapping with the wrong child in sift down: it must be the smaller one, or a child can end up out of order with its new parent.
- Mixing 0-based and 1-based formulas: with the root at index 0 the children are `2i + 1` and `2i + 2`.
- Starting heapify at the root or going upward: start at `n / 2 - 1` and go down to 0.
- Assuming the array is sorted: only `heap[0]` is guaranteed.
- Reading from an empty heap without checking `is_empty()`.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python/) | `min_heap.py` | `IndexError` on empty; stores any comparable values; constructor copies the list |
| C++ | [C++](C++/) | `min_heap.cpp` | `int` values; throws `std::runtime_error` on empty |
| Go | [Go](Go/) | `main.go` | `int` values; panics on empty; `NewMinHeapFromArray` copies the slice |

## Practice Problems

- [Kth Largest Element in a Stream (LeetCode 703)](https://leetcode.com/problems/kth-largest-element-in-a-stream/)
- [Kth Largest Element in an Array (LeetCode 215)](https://leetcode.com/problems/kth-largest-element-in-an-array/)
- [Merge k Sorted Lists (LeetCode 23)](https://leetcode.com/problems/merge-k-sorted-lists/)
- [Top K Frequent Elements (LeetCode 347)](https://leetcode.com/problems/top-k-frequent-elements/)
- [Find Median from Data Stream (LeetCode 295)](https://leetcode.com/problems/find-median-from-data-stream/)

## Related

- [Max Heap](../Max_Heap/)
- [Fibonacci Heap](../Fibonacci_Heap/)
- [Priority Queue](../../../Linear/Queue/Priority_Queue/)
- [Heap Sort](../../../../Algorithms/Sorting/Heap_Sort/)
