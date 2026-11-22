# Array

An array stores elements of one type back to back in contiguous memory, so any element is reached by index in O(1). It is the base layer for stacks, queues, heaps, hash tables and matrices. Its weak spot is the middle: inserting or deleting there shifts elements, which costs O(n).

## Intuition

Think of a row of numbered lockers of equal width. To open locker `i` you do not walk past the others: you measure `i` widths from the first one. In memory the first slot sits at `base`, each slot takes `w` bytes, and slot `i` sits at `base + i * w`. That one formula is why reads and writes are O(1) and why the block cannot grow in place: whatever follows it in memory may belong to someone else.

A dynamic array hides this by keeping a length counter and, when the block is full, allocating a larger one and copying.

## Visual

```text
int a[5], w = 4 bytes, base = 1000

address   1000  1004  1008  1012  1016
        +-----+-----+-----+-----+-----+
        |  10 |  20 |  30 |  40 |  50 |
        +-----+-----+-----+-----+-----+
index      0     1     2     3     4

a[2] -> 1000 + 2*4 = 1008

3x3 grid stored row-major in one block (cell (i, j) -> i*cols + j):

 (0,0) (0,1) (0,2) (1,0) (1,1) (1,2) (2,0) (2,1) (2,2)
   1     2     3     4     5     6     7     8     9
                                 ^ (1,2) = flat index 1*3+2 = 5
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `a[i]` read or write | compute the address | O(1) |
| `append(x)` | write at index `n`, grow first if full | O(1) amortized |
| `pop()` | remove the last element | O(1) |
| `insert(i, x)` | shift `a[i..n-1]` right, write `x` | O(n) |
| `remove(i)` | shift `a[i+1..n-1]` left | O(n) |
| search, unsorted / sorted | scan / binary search | O(n) / O(log n) |

The Python `DynamicArray` in this folder implements `len()`, `a[k]`, `append` and `pop`. Insert and remove are described here but not implemented.

### Growth and shrink rule of the Python `DynamicArray`

- Capacity starts at 1. `append` on a full array allocates twice the capacity and copies the elements.
- `pop` clears the vacated slot so the array does not keep the popped object alive.
- When the length falls to a quarter of the capacity or less (and is above 0), the capacity is halved. Shrinking at one half would let an append/pop pair at the boundary copy the whole array on every call.

## Step-by-Step Trace

Nine appends to `DynamicArray` (these are real outputs of the code):

| After append | Length | Capacity | Elements copied by the resize |
| --- | --- | --- | --- |
| 10 | 1 | 1 | 0 |
| 20 | 2 | 2 | 1 |
| 30 | 3 | 4 | 2 |
| 40 | 4 | 4 | 0 |
| 50 | 5 | 8 | 4 |
| 60, 70, 80 | 6 to 8 | 8 | 0 |
| 90 | 9 | 16 | 8 |

Total copies for 9 appends: 1 + 2 + 4 + 8 = 15. Then popping 90, 80, 70, 60, 50 leaves 4 elements in capacity 16 / 2 = 8 (the capacity halves when the length reaches 4, a quarter of 16), and popping 30 leaves 2 elements in capacity 4.

## Complexity

| Operation | Static | Dynamic |
| --- | --- | --- |
| access | O(1) | O(1) |
| append | not possible | O(1) amortized, O(n) worst case |
| insert / remove at `i` | O(n) | O(n) |
| space | O(n) | O(n), up to a constant factor of unused slots |

Why append is amortized O(1): with doubling, the resizes copy 1, 2, 4, ... elements, each copy smaller than n, a sum below 2n. Over n appends the extra copying is below 2n, so each append costs a constant on average. For example, 1000 appends from capacity 1 perform 1023 element copies in resizes. One single append can still cost O(n).

## When to Use

Use an array when you need fast access by position, compact storage and fast iteration, which covers most cases. Avoid it when you insert or delete in the middle very often and never need random access (consider a linked list), or when you need ordered lookup by key (consider a hash table or a tree).

## Array vs. Alternatives

| Structure | Access | Insert at front | Append | Notes |
| --- | --- | --- | --- | --- |
| Dynamic array | O(1) | O(n) | O(1) amortized | cache-friendly default |
| Singly linked list | O(n) | O(1) | O(n) without a tail pointer | no shifting, pointer per node |
| Hash table | O(1) by key | n/a | O(1) average | unordered |
| Circular buffer | O(1) | O(1) | O(1) | fixed capacity |

## Common Pitfalls

- Off-by-one at the end: valid indexes are `0` to `n - 1`. The Python `DynamicArray` raises `IndexError` for `a[n]` and rejects negative indexes.
- Keeping pointers or iterators across growth: a `std::vector` reallocation invalidates them.
- Go slice aliasing: `b := a[:2]` shares storage with `a`, so `append(b, x)` can overwrite `a[2]`.
- Shrinking at half full makes append/pop at the boundary thrash. Shrink at a quarter.
- Not clearing popped slots in a garbage-collected language keeps the object alive.
- Inserting at the front in a loop is O(n^2).
- Column-by-column traversal of a row-major grid jumps `cols` slots per step and wastes the cache.

## Implementations

| Language | Folder | Main files | Notes |
| --- | --- | --- | --- |
| Python | [`Python/`](Python) | `dynamic_array.py`, `static_array.py`, `multi_dimensional_array.py` | `DynamicArray` is a real reusable type; the other two are demos over `array.array` and nested lists |
| C++ | [`C++/`](C++) | `dynamic_array.cpp`, `static_array.cpp`, `multi_dimensional_array.cpp` | demo programs over `std::vector` and C arrays; tests check the language built-ins |
| Go | [`Go/`](Go) | `dynamic_array/`, `static_array/`, `multi_dimensional_array/` | three separate modules, each with its own `go.mod`; slices and arrays; tests check built-ins |

## Practice Problems

- [Increasing Array (CSES 1094)](https://cses.fi/problemset/task/1094)
- [Remove Duplicates from Sorted Array (LeetCode 26)](https://leetcode.com/problems/remove-duplicates-from-sorted-array/)
- [Rotate Array (LeetCode 189)](https://leetcode.com/problems/rotate-array/)
- [Product of Array Except Self (LeetCode 238)](https://leetcode.com/problems/product-of-array-except-self/)
- [Spiral Matrix (LeetCode 54)](https://leetcode.com/problems/spiral-matrix/)

## Related

- [Singly Linked List](../Linked_List/Singly)
- [Dynamic Stack](../Stack/Dynamic_Array_Stack)
- [Circular Queue](../Queue/Circular_Queue)
- [Hash Table](../../Hashing/Hash_Table)
- [Binary Search](../../../Algorithms/Searching/Binary_Search)
