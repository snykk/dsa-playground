# Reservoir Sampling

Reservoir sampling selects `k` items **uniformly at random** from a stream of **unknown length** in one pass, using only O(k) memory. After `n` items, each of them is in the sample with probability exactly `k/n`.

## Intuition

You have a firehose of items (log lines, sensor readings) and can store only `k` of them. At the end, every item that went by must have had the same chance of being in the final sample.

If the item after the first `k` always replaced a stored one you would favor late arrivals; if it never did you would favor early ones. The fix: the i-th item (1-indexed, `i > k`) is accepted with probability `k/i`, and when accepted it replaces a uniformly random slot. Late items enter less often, but they also have less time to be evicted, and the two effects cancel exactly.

The invariant: after `i` items, every one of them is in the reservoir with probability `k/i`.

## Visual

```text
Stream:   a  b  c  d  e  f  ...        k = 2

i=1 (a): room             -> [a, _]
i=2 (b): room             -> [a, b]
i=3 (c): accept prob 2/3  -> replace a random slot
i=4 (d): accept prob 2/4  -> replace a random slot
i=5 (e): accept prob 2/5  -> ...
i=6 (f): accept prob 2/6  -> ...
```

## How It Works

1. Fill the reservoir with the first `k` items.
2. For each later item `i` (1-indexed), draw `j` uniformly from `0 .. i - 1`.
3. If `j < k`, overwrite `reservoir[j]` with the item; otherwise discard it. One draw gives both the `k/i` acceptance and the uniform slot.

```text
reservoirSample(stream, k):
    reservoir = []; seen = 0
    for item in stream:
        seen = seen + 1
        if seen <= k:
            reservoir.append(item)
        else:
            j = random integer in [0, seen - 1]
            if j < k:
                reservoir[j] = item
    return reservoir
```

### Why every item ends with probability k/n

Item `i > k` is in the final sample if it enters (probability `k/i`) and survives each later step `j`, where it is evicted only if the new item enters (`k/j`) and picks its slot (`1/k`), so it survives with `(j-1)/j`:

```text
P = (k/i) * (i/(i+1)) * ((i+1)/(i+2)) * ... * ((n-1)/n) = k/n
```

The product telescopes. Items `i <= k` enter with probability 1 and survive by the same product.

## Step-by-Step Trace

`k = 2`, stream `a b c d e f`, using Python `random.Random(8)`:

| i | Item | Draw j | Action | Reservoir |
|---|------|--------|--------|-----------|
| 1 | a | - | fill | [a] |
| 2 | b | - | fill | [a, b] |
| 3 | c | 0 | 0 < 2: replace slot 0 | [c, b] |
| 4 | d | 2 | 2 >= 2: reject | [c, b] |
| 5 | e | 3 | 3 >= 2: reject | [c, b] |
| 6 | f | 1 | 1 < 2: replace slot 1 | [c, f] |

## Complexity

| Aspect | Cost | Why |
|--------|------|-----|
| Time | O(n) | one draw and at most one write per item |
| Memory | O(k) | only the reservoir is stored |
| Passes | 1 | the stream length is never needed |

Algorithm L skips ahead by a random gap instead of drawing for every item, which takes expected O(k (1 + log(n/k))) time when skipping is cheap (an indexed array, say). It is not implemented here.

## When to Use

Use it for a stream of unknown or huge length, a linked list you cannot count cheaply, or a file larger than memory, whenever you need an exactly uniform sample of fixed size `k`.

Do not use it when all the data is in memory with a known length (shuffle or pick random indexes), when you need weighted sampling (use a weighted variant such as A-Res), or when you only need a count of distinct items (a sketch such as HyperLogLog).

## Reservoir Sampling vs. Alternatives

| Technique | Needs n first | Memory | Notes |
|-----------|---------------|--------|-------|
| Reservoir sampling | No | O(k) | one pass over a stream |
| Shuffle, take the first k | Yes | O(n) | all data in memory |
| Random indexes | Yes | O(k) | needs random access |
| Bernoulli sampling with probability p | No | O(pn) | sample size is random, not exactly k |
| Weighted reservoir (A-Res) | No | O(k) | unequal weights |

## Common Pitfalls

1. **Always replacing slot 0.** The accept test is right but the slot must be uniform.
2. **Off-by-one on the range.** With `i` counted from 1, draw from `0 .. i - 1` and accept `j < k`.
3. **A 32-bit counter.** A stream can pass 2^31 items. The C++ sampler used an `int` counter that overflowed; it is now `std::uint64_t`.
4. **Sharing a generator between threads.** Give each thread its own, and fix the seed in tests.
5. **Calling a shuffle reservoir sampling.** A shuffle needs all the data; reservoir sampling needs one pass.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `reservoir_sampling.py` | any iterable; `ReservoirSampler` class; optional `random.Random` |
| C++ | [C++/](C++/) | `reservoir_sampling.h` | header-only template `ReservoirSampler<T>`; 64-bit counter; `std::mt19937` |
| Go | [Go/](Go/) | `main.go` | `Sampler` and `ReservoirSample`; `[]int` only; per-instance `*rand.Rand` |

## Practice Problems

- [Linked List Random Node (LeetCode 382)](https://leetcode.com/problems/linked-list-random-node/)
- [Random Pick Index (LeetCode 398)](https://leetcode.com/problems/random-pick-index/)
- [Random Point in Non-overlapping Rectangles (LeetCode 497)](https://leetcode.com/problems/random-point-in-non-overlapping-rectangles/)

## Related

- [Randomized Quickselect](../Randomized_Quickselect/README.md) - another randomized algorithm for large data.
- [Randomized Algorithms overview](../README.md)
