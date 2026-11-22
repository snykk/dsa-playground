# Max Heap

A max heap is a complete binary tree stored in an array in which every parent is `>=` its children, so the largest element is always at index 0. Peek is O(1), insert and extract are O(log n), and building from an array is O(n).

## Intuition

Think of a tournament bracket where only the winner matters: the heap does not rank everyone, it only guarantees that each parent beats its children. That partial order is cheap to repair. A change touches one root-to-leaf path, of length about log2(n).

Two rules make it work:

- **Shape:** the tree is complete (every level full except the last, which fills from the left), so it fits in an array with no gaps.
- **Order:** parent `>=` children. Siblings are not ordered.

## Visual

```text
Array [10, 5, 8, 4, 1, 3]   (index i: children 2i+1 and 2i+2, parent (i-1)/2)

       10
       /  \
      5    8
     / \  /
    4  1 3
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `peek()` | return the root | O(1) |
| `insert(x)` | append, then sift up while the parent is out of order | O(log n) |
| `extract_max()` | return the root, move the last element to the root, sift down by swapping with the larger child | O(log n) |
| constructor from array | bottom-up heapify from index `n / 2 - 1` to 0 | O(n) |
| `size()`, `is_empty()`, `clear()` | bookkeeping | O(1) |

Empty heap: `peek` and `extract_max` raise `IndexError` in Python, throw `std::runtime_error` in C++ and panic in Go.

## Step-by-Step Trace

Insert `4, 10, 3, 5, 1, 8` one by one, then extract the maximum (real run of the Python code):

| Step | Array | What happens |
| --- | --- | --- |
| insert 4 | `[4]` | first element |
| insert 10 | `[10, 4]` | 10 > parent 4, swap to the root |
| insert 3 | `[10, 4, 3]` | parent 10 is larger, no swap |
| insert 5 | `[10, 5, 3, 4]` | swapped with parent 4 |
| insert 1 | `[10, 5, 3, 4, 1]` | parent 5 is larger |
| insert 8 | `[10, 5, 8, 4, 1, 3]` | swapped with parent 3 |
| extract: move last to root | `[3, 5, 8, 4, 1]` | return 10; children of 3 are 5 and 8 |
| swap with larger child | `[8, 5, 3, 4, 1]` | 3 has no children left, stop |

## Complexity

| Operation | Time | Why |
| --- | --- | --- |
| peek | O(1) | the root is index 0 |
| insert | O(log n) | at most one swap per level climbed |
| extract_max | O(log n) | at most one swap per level descended |
| build from array | O(n) | at most n / 2^(h+1) nodes have height h and sink at most h levels, so the sum n * (sum h / 2^(h+1)) is O(n) |
| search for a value | O(n) | no order between siblings |

Space is O(n) for the array; the operations are iterative, so there is no recursion stack. Building by n inserts instead costs O(n log n).

## When to Use

- Use it when you repeatedly need the largest item: largest-first scheduling, heap sort, the lower half in a running median.
- To keep the k **smallest** of a stream, hold a max heap of size k and replace the root when a smaller value arrives (O(n log k)).
- Do not use it when you need sorted iteration, arbitrary search or priority updates.

## Max Heap vs. Alternatives

| Structure | Peek | Insert | Remove top | Notes |
| --- | --- | --- | --- | --- |
| Max heap | O(1) | O(log n) | O(log n) | compact array |
| Sorted array | O(1) | O(n) | O(1) | inserts shift elements |
| Unsorted array | O(n) | O(1) | O(n) | cheap only if you rarely query |
| Balanced BST | O(log n) | O(log n) | O(log n) | also sorted iteration and search |
| Min heap | - | - | - | mirror image, see [Min Heap](../Min_Heap/) |

In-place heap sort with a max heap yields **ascending** order: each extraction moves the maximum to the end of the array. It is descending only if you extract into a new list. The `MaxHeap` class itself does not sort in place.

## Common Pitfalls

- Swapping with the wrong child in sift down: it must be the larger one, or a child can end up out of order with its new parent.
- Mixing 0-based and 1-based formulas: with the root at index 0 the children are `2i + 1` and `2i + 2`.
- Starting heapify at the root or going upward: start at `n / 2 - 1` and go down to 0.
- Assuming the array is sorted: only `heap[0]` is guaranteed.
- Reading from an empty heap without checking `is_empty()`.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python/) | `max_heap.py` | `IndexError` on empty; stores any comparable values; constructor copies the list |
| C++ | [C++](C++/) | `max_heap.cpp` | `int` values; throws `std::runtime_error` on empty |
| Go | [Go](Go/) | `main.go` | `int` values; panics on empty; `NewMaxHeapFromArray` copies the slice |

## Practice Problems

- [Last Stone Weight (LeetCode 1046)](https://leetcode.com/problems/last-stone-weight/)
- [Kth Largest Element in an Array (LeetCode 215)](https://leetcode.com/problems/kth-largest-element-in-an-array/)
- [K Closest Points to Origin (LeetCode 973)](https://leetcode.com/problems/k-closest-points-to-origin/)
- [Find Median from Data Stream (LeetCode 295)](https://leetcode.com/problems/find-median-from-data-stream/)

## Related

- [Min Heap](../Min_Heap/)
- [Fibonacci Heap](../Fibonacci_Heap/)
- [Priority Queue](../../../Linear/Queue/Priority_Queue/)
- [Heap Sort](../../../../Algorithms/Sorting/Heap_Sort/)
