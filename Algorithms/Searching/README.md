# Searching Algorithms

Searching finds a target in a collection. Linear Search needs no order and checks every element. The other three need sorted data and discard large parts of it. Binary Search halves the range, Ternary Search thirds it, and Interpolation Search guesses the position from the values.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Linear Search](Linear_Search/) | The baseline. Check the elements one by one; it works on unsorted data, linked lists and streams. | Beginner |
| 2 | [Binary Search](Binary_Search/) | Compare with the middle and discard the half that cannot hold the target. O(log n) on sorted arrays. | Beginner |
| 3 | [Ternary Search](Ternary_Search/) | Two probes cut the range into thirds. More probes than Binary Search; its real use is the peak of a unimodal function. | Intermediate |
| 4 | [Interpolation Search](Interpolation_Search/) | Estimate the position from the values at both ends. About log log n probes on even keys, linear on skewed ones. | Intermediate |

## How They Compare

| Algorithm | Best | Average | Worst | Extra space | Needs sorted data |
|-----------|------|---------|-------|-------------|-------------------|
| Linear | O(1) | O(n) | O(n) | O(1) | No |
| Binary | O(1) | O(log n) | O(log n) | O(1) | Yes |
| Ternary | O(1) | O(log n) | O(log n) | O(1) | Yes |
| Interpolation | O(1) | O(log log n) | O(n) | O(1) | Yes |

Extra space is for the iterative versions. The recursive versions use stack: O(n) for Linear Search, O(log n) for Binary Search, about log3(n) frames for Ternary Search, and O(n) in the worst case for Interpolation Search. Ternary Search makes `2 log3(n)` probes against Binary Search's `log2(n)`, about 1.26 times as many, so for plain lookup it loses. Interpolation Search is the only one whose speed depends on the values, not only on `n`.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Unsorted data, a tiny array, or one query | Linear Search | no preconditions, and sorting first would cost more than one scan |
| A linked list or a stream | Linear Search | the other three need to read any index in O(1) |
| Many lookups in a sorted array | Binary Search | O(log n) on every distribution, with a short loop |
| Large sorted array of roughly evenly spread numbers | Interpolation Search | about log log n probes; its worst case is O(n) |
| The peak of a unimodal function | Ternary Search | two evaluations per round tell which side of the peak you are on |
| The first or last of several equal values | Binary Search variants | the first-occurrence and last-occurrence versions keep searching after a match |
| Exact lookups with no ordering needs | a hash table | O(1) average, at the cost of memory and a build step |

## Common Pitfalls

- A sorted search on unsorted data returns a wrong result and nothing warns you.
- Computing the middle as `(lo + hi) / 2` can overflow in C++ and Go on huge arrays. The repository writes `lo + (hi - lo) / 2`.
- Plain Binary, Ternary and Interpolation Search return some matching index among duplicates. Use the first-occurrence or last-occurrence variant of Binary Search when the position matters.
- Interpolation Search divides by zero when `a[lo] == a[hi]`, so the code checks for a flat window first. On skewed keys such as powers of two it removes about one element per probe and becomes linear.
- Ternary Search needs a strictly unimodal function: on a plateau it can return the wrong peak.

## Related

- [Big-O Notation](../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Sorting Algorithms](../Sorting/): the sorted order that Binary, Ternary and Interpolation Search require.
- [Divide and Conquer Algorithms](../Divide_and_Conquer/): Binary Search discards all but one part at every step.
- [Binary Search on Answer](../../Problem_Patterns/Binary_Search_on_Answer/): Binary Search on a yes-or-no test that flips once.
- [Hashing](../../Data_Structures/Hashing/): O(1) average exact lookups with no ordering.
