# Amortized Analysis

Amortized analysis bounds the total cost of any sequence of operations and divides by the number of operations. It explains why a dynamic array can have an occasional O(n) append and still guarantee O(1) per append over the sequence. It is a worst-case guarantee over the sequence, not an average over random input.

## Intuition

Think of a monthly bill. Most days you spend nothing, one day you pay rent. The rent is large, but if you set a little aside each day it is "paid for" in advance, and your daily cost is small and steady.

A doubling dynamic array works the same way. A resize copies `size` elements, but it also creates `size` free slots, so the next `size` appends are cheap. Each expensive operation buys a long run of cheap ones.

Amortized cost is **not** average-case cost. There is no randomness: the bound holds for every sequence of operations, including a worst one chosen by an adversary. What it does not promise is anything about a single operation: one append can still cost O(n).

## Visual

```text
DynamicArray, initial capacity 2, appending 0..7 (cost = 1 write + elements copied)

append 0: [0 _]                   cost 1
append 1: [0 1]                   cost 1
append 2: [0 1 2 _]  copy 2       cost 3   resize
append 3: [0 1 2 3]               cost 1
append 4: [0 1 2 3 4 _ _ _] copy 4 cost 5  resize
append 5..7: cheap                cost 1 each

total = 8 writes + 6 copies = 14 steps  ->  1.75 per append  (<= 3)
```

## How It Works

Three methods prove the same bound.

1. **Aggregate method.** Bound the total cost `T(n)` of `n` operations, then divide by `n`. For the dynamic array the copies sum to `1 + 2 + 4 + ... < 2n`, so `T(n) < 3n`.
2. **Accounting method.** Charge each operation a fixed amortized cost. The surplus is stored as credit and pays for later expensive operations. The credit must never go negative. For appends, charge 3: one for the write, one for copying the new element at the next resize, one for copying an older element.
3. **Potential method.** Define a potential `Phi` of the structure's state. The amortized cost of an operation is `actual + Phi(after) - Phi(before)`. Over the sequence the potential terms telescope, so if `Phi` never ends below its starting value, total amortized cost is an upper bound on total actual cost. The repository uses `Phi = 2 * size - capacity`.

The binary counter follows the same pattern. Bit 0 flips on every increment, bit 1 on every second, bit 2 on every fourth, so `n` increments flip at most `n + n/2 + n/4 + ... < 2n` bits.

## Step-by-Step Trace

First 8 increments of a 4-bit `BinaryCounter`:

| Increment | Counter after | Bits flipped | Total so far |
|-----------|---------------|--------------|--------------|
| 1 | 0001 | 1 | 1 |
| 2 | 0010 | 2 | 3 |
| 3 | 0011 | 1 | 4 |
| 4 | 0100 | 3 | 7 |
| 5 | 0101 | 1 | 8 |
| 6 | 0110 | 2 | 10 |
| 7 | 0111 | 1 | 11 |
| 8 | 1000 | 4 | 15 |

Eight increments flipped 15 bits in total, below the bound of 2n = 16.

Accounting demo (`accounting_method_example`) for 8 appends, charging 3 each:

| Append | Actual | Charged | Bank after |
|--------|--------|---------|------------|
| 0 | 1 | 3 | 2 |
| 1 | 1 | 3 | 4 |
| 2 (resize) | 3 | 3 | 4 |
| 3 | 1 | 3 | 6 |
| 4 (resize) | 5 | 3 | 4 |
| 5 | 1 | 3 | 6 |
| 6 | 1 | 3 | 8 |
| 7 | 1 | 3 | 10 |

The bank never goes negative, so charging 3 per append always covers the real cost (14 actual, 24 charged).

## Complexity

| Structure | Operation | Worst single operation | Amortized |
|-----------|-----------|------------------------|-----------|
| Dynamic array (doubling) | append | O(n) | O(1) |
| Dynamic array | get | O(1) | O(1) |
| Binary counter | increment | O(log n) | O(1) |
| Stack with multipop | push, pop, multipop | O(n) | O(1) |
| Splay tree | search, insert, delete | O(n) | O(log n) |
| Hash table with resizing | insert | O(n) | O(1) expected (random hashing) |

Space for the dynamic array is O(n): after doubling, the capacity is at most twice the size.

## When to Use

Use an amortized bound when only the **total** running time of a sequence matters, for example a loop that performs `n` appends. Do not rely on it when every single operation has a deadline (real-time systems, latency-sensitive requests): a resize really does take O(n). Preallocate capacity or use a structure with a worst-case guarantee per operation instead.

## Amortized vs. Average-Case vs. Worst-Case

| | Worst case | Average case | Amortized |
|---|------------|--------------|-----------|
| Applies to | one operation | one operation on random input | a sequence of operations |
| Needs probability | no | yes | no |
| Bounds a single operation | yes | no (only its mean) | no |
| Example | append is O(n) | quick sort is O(n log n) on random input | append is O(1) |

## Common Pitfalls

- Calling amortized analysis "average-case analysis". It is a worst-case bound over sequences.
- Assuming each operation is cheap. An amortized O(1) append still has an O(n) worst case.
- Growing by a constant amount instead of a factor. Adding `k` slots per resize makes `n` appends cost O(n^2 / k) in total.
- Treating a hash table's O(1) as simply amortized: it is expected (over random hashing) and amortized (because of resizing).
- Forgetting that the credit or potential must never go negative, otherwise the proof is invalid.
- Believing every library grows by 2x. Some use about 1.5x; any constant factor above 1 keeps O(1) amortized.

## Implementations

- [Python](./Python/amortized_analysis.py): `DynamicArray`, `BinaryCounter`, and demos of the aggregate, accounting and potential methods.
- [C++](./C++/amortized_analysis.cpp): `DynamicArray` and `BinaryCounter` with a short demo.
- [Go](./Go/main.go): `DynamicArray` and `BinaryCounter` with a short demo.

All three count total element copies (`copies`) and total bit flips (`flips`); the tests check that copies stay at most 2n and flips at most 2n. An initial capacity of 0 grows to 1.

## Practice Problems

- [Implement Queue using Stacks (LeetCode 232)](https://leetcode.com/problems/implement-queue-using-stacks/): each element moves between the stacks at most twice, so operations are O(1) amortized.
- [Min Stack (LeetCode 155)](https://leetcode.com/problems/min-stack/): constant-time operations backed by an auxiliary stack.
- Prove that `n` increments of a binary counter flip fewer than 2n bits, using each of the three methods.

## Related

- [Space Complexity](../Space%20Complexity/)
- [Big-O Notation](../Time%20Complexity/Big-O%20Notation/)
- [Dynamic array stack](../../Data%20Structures/Linear/Stack/Array%20Based/Dynamic%20Size/)
- [Splay Tree](../../Data%20Structures/Non_Linear/Trees/Splay%20Tree/)
- [Hash Table](../../Data%20Structures/Hashing/Hash%20Table/)
