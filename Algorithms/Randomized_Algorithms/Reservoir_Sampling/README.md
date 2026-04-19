# Reservoir Sampling

> Given a stream of items with **unknown length**, select `k` items **uniformly at random** using only O(k) memory. You don't know how long the stream is until it ends — but each of the final `n` items still has an equal `k/n` probability of appearing in your sample.

---

## 🎯 Intuition

You have a firehose of items (log entries, sensor readings, tweets) and you can store only `k` of them. At the end, every one of the items that passed by must have had the same chance of being in your final sample of size `k`.

**The problem if you're naive:** once you've stored `k` items, should the (k+1)-th item replace one of them? If yes, which? If you always replace with probability 1, you bias toward late arrivals; if you never replace, you bias toward early arrivals.

**Reservoir's answer:** for the i-th item (1-indexed, i > k), accept it into the reservoir with probability `k/i`, replacing a uniformly-random slot. That's it. This single rule gives every item an equal final probability of being selected.

---

## 📊 Visual

```
Stream:          a  b  c  d  e  f  g  ...
k = 2

i=1 (a): reservoir has room → store              [a, _]
i=2 (b): reservoir has room → store              [a, b]
i=3 (c): accept with prob 2/3 → replace random   [a, c] or [c, b]
i=4 (d): accept with prob 2/4 → replace random   probability 0.5 each
i=5 (e): accept with prob 2/5 → replace random
i=6 (f): accept with prob 2/6 → replace random
...
```

At the end of a stream of length `n`, any individual item's probability of being in the reservoir is exactly `k/n`. That's uniform random sampling.

---

## 🧮 Algorithm

### Algorithm R (Vitter, 1985)

```
reservoir = []
for i, item in enumerate(stream, start=1):
    if i <= k:
        reservoir.append(item)              # fill phase
    else:
        j = random_int(1, i)                # uniform in [1, i]
        if j <= k:
            reservoir[j-1] = item           # replace slot j
```

O(n) time, O(k) space, **one pass** over the stream.

---

## 🚶 Why It Works (Probability Proof Sketch)

After processing the first `n` items, the probability that item `x` (seen at step `i`) is in the reservoir is:

```
P(x in reservoir) = P(x enters at step i) × P(x survives steps i+1..n)

P(x enters at step i):   k/i   (for i > k; probability 1 for i ≤ k)
P(x survives each later step j): probability j-th item doesn't replace x's slot
                               = 1 - (k/j × 1/k) = 1 - 1/j = (j-1)/j

Total: (k/i) × ∏_{j=i+1}^{n} (j-1)/j
     = (k/i) × (i/n)  (telescoping product)
     = k/n
```

Same `k/n` for every item regardless of when it arrived — that's the magic.

---

## ⏱️ Complexity

| Operation | Cost |
|-----------|------|
| Time | O(n) |
| Space | **O(k)** — the reservoir only |
| Passes over stream | **1** |

A better variant, **Algorithm L (Li, 1994)**, achieves O(k · (1 + log(n/k))) expected time by computing how many items to skip via a geometric-ish distribution. Useful when `n` is huge and `k` is small (e.g., sampling 10 items from a trillion-item stream).

---

## 🎯 When to Use

✅ **Perfect fit:**
- Log sampling — keep k random log lines per day
- A/B test traffic sampling
- Distributed compute: each worker does local reservoir sampling, then combine
- Database `SAMPLE` operators
- Reservoir sampling appears in Twitter / Kafka / Splunk internals

❌ **Not the right tool:**
- You already have all the data in memory → just shuffle and pick first `k`
- Stream is bounded + small → `random.sample` is fine
- You need _weighted_ sampling — use [Weighted Reservoir Sampling](https://en.wikipedia.org/wiki/Reservoir_sampling#Weighted_random_sampling) (algorithm A-Res)

---

## ⚠️ Common Pitfalls

1. **Using `random.random() < k/i`** (a Bernoulli trial) is correct for "should I accept?" — but only if you then pick a _random_ slot to replace. A common bug: always replace slot 0.
2. **Off-by-one on 1-indexed vs 0-indexed i.** If your stream is 0-indexed, the formula is `j = random_int(0, i)`, accept if `j < k`. Test with `k = 1` and a stream of 10 items — expected distribution is 10% each.
3. **Not seeding the RNG**: tests that don't set a seed are flaky. Set `random.seed(fixed)` in tests and use `random.Random()` per-instance in production.
4. **Thread safety**: Python's `random` is thread-safe (uses locks); Go's global `math/rand` is also locked; C++'s `std::mt19937` is **not** — give each thread its own RNG.
5. **Multiple passes assumed**: many students first write a "shuffle the array and take first k" solution and call it reservoir sampling. It's not — reservoir sampling's whole point is _single pass over a stream_.

---

## ⚔️ Reservoir Sampling vs. Alternatives

| Technique | When |
|-----------|------|
| **Reservoir Sampling** | Stream of unknown length, need uniform sample |
| **Fisher-Yates shuffle + first k** | All data fits in memory |
| **`random.sample`** | Same as above, short implementation |
| **Weighted reservoir (A-Res)** | Weighted stream, need weighted-uniform sample |
| **Count-distinct sketches (HyperLogLog)** | Don't need the items themselves, just count |

---

## 🔧 Implementations

| Language | Folder | Notes |
|----------|--------|-------|
| Python | [Python/](Python/) | Generator-friendly; supports arbitrary iterables |
| C++ | [C++/](C++/) | Uses `std::mt19937` and `std::uniform_int_distribution` |
| Go | [Go/](Go/) | Takes a `io.Reader`-style iterator via channel |

---

## 📝 Practice Problems

- [LeetCode 382. Linked List Random Node](https://leetcode.com/problems/linked-list-random-node/) — reservoir on a singly linked list (you can't count it first)
- [LeetCode 398. Random Pick Index](https://leetcode.com/problems/random-pick-index/)
- [LeetCode 519. Random Flip Matrix](https://leetcode.com/problems/random-flip-matrix/)

---

## 🔗 Related

- [Randomized Quickselect](../Randomized_Quickselect/README.md) — the other "randomization replaces algorithmic complexity" pattern.
- [Randomized Algorithms overview](../README.md)

---

_Part of [Randomized Algorithms](../README.md)._
