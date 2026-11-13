# Randomized Algorithms

A randomized algorithm uses random numbers as part of its logic. The two topics here use them in different ways. Randomized Quickselect picks a random pivot so that no input is bad for it, and Reservoir Sampling draws random numbers because a uniform sample cannot be made without them.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Randomized Quickselect](Randomized_Quickselect/) | Partition around a random pivot and keep only the side that holds rank k. O(n) expected time, in place. | Intermediate |
| 2 | [Reservoir Sampling](Reservoir_Sampling/) | Keep k items from a stream of unknown length in one pass, so that every item ends up in the sample with probability k/n. | Intermediate |

Quickselect always returns the correct element, and only its running time varies from run to run. Reservoir Sampling always returns exactly `k` items, or all of them when the stream is shorter, and which items it keeps is the random part.

## How They Compare

| Topic | What is random | Input | Output | Time | Extra space |
|-------|----------------|-------|--------|------|-------------|
| Randomized Quickselect | the pivot of every round | an array in memory and a rank k | the k-th smallest element, always correct | O(n) expected, O(n^2) worst | O(1) |
| Reservoir Sampling | which slot a new item replaces, and whether it enters | a stream of unknown length and a size k | a uniform sample of k items | O(n) | O(k) |

Quickselect reorders the array it is given, so copy it first when the order matters. Reservoir Sampling reads each item once and never stores the stream. Quickselect's quadratic worst case needs nearly every pivot to land near the minimum or maximum, which is very unlikely for large `n`. Reservoir Sampling has no best or worst input: its cost depends only on the stream length.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| The median or another single rank of an array in memory | Randomized Quickselect | O(n) expected, without sorting the rest |
| Many ranks of the same array, or the sorted order too | sort once | one O(n log n) sort answers every later rank |
| A hard worst-case bound on the rank | median of medians | O(n) worst case, with a larger constant factor |
| A sample of k items from a stream of unknown length | Reservoir Sampling | one pass, O(k) memory, and every item has probability k/n |
| A sample from an array whose length is known | pick random indexes | no need for a pass over the whole data |
| A fixed, repeatable result in tests | pass a seeded generator | both Python functions accept an `rng` argument |

## Common Pitfalls

- Recursing into both sides in Quickselect is Quick Sort and costs O(n log n). Keep only the side that holds `k`.
- A two-way partition in Quickselect becomes quadratic on many equal keys. The code here uses a three-way partition.
- Quickselect is 0-indexed here: `k = 0` is the minimum and `k = n - 1` the maximum.
- In Reservoir Sampling the accept test is right only if the replaced slot is chosen uniformly.
- A shuffle is not reservoir sampling: a shuffle needs all the data in memory, while the point here is one pass.

## Related

- [Big-O Notation](../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Quick Sort](../Sorting/Quick_Sort/): Quickselect uses its partition. Read it first.
- [Sorting Algorithms](../Sorting/): sort once when you need many ranks or the full order.
- [Divide and Conquer Algorithms](../Divide_and_Conquer/): Quickselect's expected O(n) is the root-dominates case of a recurrence.
- [Treap](../../Data_Structures/Non_Linear/Trees/Treap/): a randomized self-balancing search tree.
- [Bloom Filter](../../Data_Structures/Hashing/Bloom_Filter/): a probabilistic membership test.
