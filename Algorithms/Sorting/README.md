# Sorting Algorithms

Sorting puts a list in order. The ten algorithms here all return the same result and differ in speed, memory and stability. The simple ones take O(n^2) time, Shell Sort beats them in practice by inserting over shrinking gaps, the divide-and-conquer and heap sorts take O(n log n), and the three that never compare two keys go below that bound on suitable data.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Bubble Sort](Bubble_Sort/) | Swap neighbours that are out of order, so the largest value sinks to the end on every pass. Simple, and stable. | Beginner |
| 2 | [Insertion Sort](Insertion_Sort/) | Grow a sorted prefix by sliding each new value left into place. Linear on nearly sorted input. | Beginner |
| 3 | [Shell Sort](Shell_Sort/) | Insertion sort over shrinking gaps, ending with gap 1. In place and far faster than quadratic in practice; the gap sequence decides how fast. Not stable. | Intermediate |
| 4 | [Selection Sort](Selection_Sort/) | Swap the minimum of the unsorted part to the front. Always n(n - 1)/2 comparisons, but at most n - 1 swaps. | Beginner |
| 5 | [Merge Sort](Merge_Sort/) | Split in half, sort both halves, merge them. O(n log n) on every input and stable, at the cost of O(n) memory. | Intermediate |
| 6 | [Quick Sort](Quick_Sort/) | Partition around a pivot, then sort both sides. In place and fast in practice; quadratic on bad pivots. | Intermediate |
| 7 | [Heap Sort](Heap_Sort/) | Build a max-heap in the array, then move the maximum to the end again and again. Guaranteed O(n log n), not stable. | Intermediate |
| 8 | [Counting Sort](Counting_Sort/) | Count each value, turn the counts into positions, place every element. O(n + k), stable, no comparisons. | Intermediate |
| 9 | [Radix Sort](Radix_Sort/) | One stable counting sort per digit, least significant first. O(d (n + b)) for d digits in base b. | Intermediate |
| 10 | [Bucket Sort](Bucket_Sort/) | Spread values over buckets, sort each small bucket, read them out. Linear on evenly spread input. | Intermediate |

Each topic is implemented in Python, C++ and Go. Three properties tell the algorithms apart besides speed: stable (equal keys keep their order), in place (no second array of size n) and adaptive (faster on nearly sorted input).

## How They Compare

| Algorithm | Best | Average | Worst | Extra space | Stable | In place |
|-----------|------|---------|-------|-------------|--------|----------|
| Bubble | O(n) | O(n^2) | O(n^2) | O(1) | Yes | Yes |
| Insertion | O(n) | O(n^2) | O(n^2) | O(1) | Yes | Yes |
| Shell (Ciura's gaps) | O(n log n) | unknown | unknown | O(1) | No | Yes |
| Selection | O(n^2) | O(n^2) | O(n^2) | O(1) | No | Yes |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | No |
| Quick | O(n log n) | O(n log n) | O(n^2) | O(log n) | No | Yes |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(log n) | No | Yes |
| Counting | O(n + k) | O(n + k) | O(n + k) | O(n + k) | Yes | No |
| Radix | O(d (n + b)) | O(d (n + b)) | O(d (n + b)) | O(n + b) | Yes | No |
| Bucket | O(n + k) | O(n + k) | O(n^2) | O(n + k) | Inner sort decides | No |

- `k` is the size of the value range for Counting Sort (`max - min + 1`) and the number of buckets for Bucket Sort. `d` is the number of digits and `b` the base (10 here) for Radix Sort.
- Bubble and Insertion Sort reach O(n) only on sorted input. Heap Sort's best case is O(n) when all elements are equal.
- Shell Sort's bounds depend on the gaps: Theta(n^2) in the worst case with Shell's own n/2, n/4, ..., 1, O(n^(3/2)) with Knuth's, and no proven bound with Ciura's, the default, which made the fewest comparisons of the three on every random input measured.
- Quick Sort's O(log n) space holds in Python, which recurses into the smaller side. The C++ and Go versions make two recursive calls, so their stack reaches O(n) on sorted input.
- Heap Sort's O(log n) is the stack of the recursive `heapify`; a loop would reduce it to O(1).
- Bucket Sort's O(n^2) assumes Python's insertion-sorted buckets, which are stable. The C++ and Go versions use unstable library sorts.
- Counting, Radix and Bucket Sort are not comparison sorts, so the `n log n` bound does not apply to them.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| A small array, or one that is nearly sorted | Insertion Sort | no setup, O(n) on nearly sorted input, stable and in place |
| A medium array, in place, with no recursion and little code | Shell Sort | insertion sort over shrinking gaps; fast in practice, but not stable and with no proven bound for the best gaps |
| A hard O(n log n) bound, and records must keep their order | Merge Sort | stable and never worse than O(n log n), but it needs O(n) extra memory |
| General in-memory data and speed in practice | Quick Sort | in place and cache-friendly; accept the rare quadratic case, or choose the pivot with care |
| A hard O(n log n) bound and almost no extra memory | Heap Sort | in place with no pivot to choose, but not stable and usually slower than Quick Sort |
| Writing is expensive | Selection Sort | at most n - 1 swaps, far fewer than Bubble or Insertion Sort |
| Integers in a small range | Counting Sort | O(n + k) and stable; memory grows with the range, not with n |
| Integers with many values but few digits | Radix Sort | a few linear passes; it needs a stable digit sort |
| Floating-point values spread evenly over a known range | Bucket Sort | linear on average; a crowded bucket makes it quadratic |
| Only the k-th smallest value, not the full order | [Randomized Quickselect](../Randomized_Algorithms/Randomized_Quickselect/) | O(n) expected, without sorting the rest |
| Everyday code | the standard library | `sorted`, `std::sort` and `sort.Slice` are tuned and tested |

Bubble Sort has no row of its own. It is a teaching tool: Insertion Sort does the same job with fewer comparisons.

## Common Pitfalls

- Quick Sort with the last element as pivot is O(n^2) on sorted, reversed and all-equal input. Pick the pivot at random or take the median of three.
- Quick Sort, Heap Sort, Selection Sort and Shell Sort are not stable. Use Merge Sort or a stable library sort when equal keys must keep their order.
- Shell Sort with Shell's own gaps n/2, n/4, ... is Theta(n^2) when n is a power of 2 and the smaller half of the values sits at the even positions: no pass before the last compares an even position with an odd one. Use Ciura's or Knuth's gaps.
- Merge Sort is not in place: its temporary halves cost O(n) extra memory.
- Counting Sort on a huge range is unusable, because time and memory grow with `k = max - min + 1`.
- Radix Sort needs a stable digit sort. An unstable one scrambles the work of the earlier digits.

## Related

- [Big-O Notation](../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Searching Algorithms](../Searching/): Binary Search needs sorted data, which these produce.
- [Divide and Conquer Algorithms](../Divide_and_Conquer/): Merge Sort and Quick Sort are divide-and-conquer sorts.
- [Randomized Quickselect](../Randomized_Algorithms/Randomized_Quickselect/): Quick Sort's partition with a random pivot, used to select one rank.
- [Max Heap](../../Data_Structures/Non_Linear/Heaps/Max_Heap/): the structure Heap Sort builds in the array.
