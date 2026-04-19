# Treap (Randomized BST)

> A **Treap** is a **Tree** + **Heap** hybrid. Each node stores a **key** (organized as a BST) and a **random priority** (organized as a max-heap). The randomness guarantees an expected **O(log n) height**, giving us a self-balancing BST without the complex rotations of AVL or Red-Black trees.

---

## 🎯 Intuition

Balanced BSTs (AVL, Red-Black) are fast but fiddly: you need precise rotations, color invariants, and careful deletion cases. A **Treap** achieves the same O(log n) operations by being **probabilistically balanced** — you skip the deterministic balancing and let randomness do the work.

The trick:
- **Keys** obey BST order: left < root < right.
- **Priorities** obey max-heap order: parent ≥ children.

If you insert keys in any order but give each a **uniformly random priority**, the tree you build is equivalent to having inserted the keys **in decreasing priority order** — a random permutation. The expected height of a BST built from a random permutation is O(log n). So the treap is balanced _in expectation_ with no explicit balancing logic.

It's the simplest self-balancing BST to implement correctly — one reason it's popular in competitive programming.

---

## 📊 Visual

```
Keys with random priorities in parentheses (higher = closer to root):

Insert order: 3, 1, 4, 1.5, 9, 2, 6, 5

Final treap (one possible layout given random priorities):

            (8)6
           /      \
       (7)4       (5)9
       /    \
    (4)1.5  (3)5        ← priorities: 4 > 3, heap property OK
     /  \
  (2)1  (1)3            ← BST property: 1 < 3; heap: 2 > 1 OK ✓
         \
         (0)2           ← 1 < 2 < 3 ✓

BST inorder traversal: 1, 1.5, 2, 3, 4, 5, 6, 9 ✓ (sorted!)
Heap: root priority 8 beats all descendants ✓
```

---

## 🧮 Operations

### Insert `(key, priority)`
1. Walk down as in a BST based on key until you hit a null leaf.
2. Insert the new node there.
3. Walk back up: if the new node's priority exceeds its parent's, **rotate** to push it up. Repeat until heap property holds or it becomes the root.

### Delete `key`
1. Find the node via BST search.
2. While it has children, rotate its _lower-priority_ child up.
3. Once it's a leaf, unlink it.

### Split (by key `k`)
Splits the treap into two: one with keys `< k`, one with keys `≥ k`. O(log n) expected.

### Merge (left treap `L`, right treap `R`)
Assumes all keys in `L < ` all keys in `R`. Rebuilds into a single treap. O(log n) expected.

The **split/merge** pair is the real superpower: it lets you do range-based operations (insert a whole range, reverse a range, lazy-propagate over a range) in O(log n) — something AVL and Red-Black can't do without more work.

---

## 🚶 Rotation Walkthrough

A right rotation (promoting the left child):

```
     P                      L
    / \                    / \
   L   R    ───►          X   P
  / \                        / \
 X   Y                      Y   R
```

Key order preserved: `X < L < Y < P < R` before and after.
Heap priorities may flip — check after the rotation.

---

## ⏱️ Complexity — and Why

| Operation | Expected | Worst case | Probability of worst |
|-----------|----------|-----------|----------------------|
| Search | O(log n) | O(n) | negligible (exponentially unlikely) |
| Insert | O(log n) | O(n) | negligible |
| Delete | O(log n) | O(n) | negligible |
| Split / Merge | O(log n) | O(n) | negligible |

**Why it works**: the tree built by inserting random-priority nodes is distributed identically to a BST built by inserting keys in a uniformly random order. The expected height of such a BST is `O(log n)` with high probability. Only an adversarial sequence of _priorities_ could force O(n) — and since priorities are chosen by the algorithm, the adversary can't do that.

---

## 🎯 When to Use

✅ **Reach for Treap when:**
- You want a self-balancing BST but can't afford AVL / RB complexity
- You need split/merge for range DP, implicit treaps, or persistent DS
- Competitive programming: fast to write, good constants
- Randomness is acceptable (no cryptographic adversary)

❌ **Avoid when:**
- You need deterministic worst-case O(log n) per op (e.g. real-time systems) → use AVL or RB
- You don't need balance (cache / FIFO-like workload) → plain BST or hash map
- Keys come with their own natural priorities that are adversarial → RB is safer

---

## ⚔️ Treap vs. AVL vs. Red-Black

| Tree | Balance guarantee | Insert rotations | Code complexity | Best for |
|------|-------------------|------------------|-----------------|----------|
| **Treap** | O(log n) **expected** | ≤ O(log n) expected | 🟢 Simple | CP, range ops (split/merge) |
| **AVL** | O(log n) worst | O(log n) worst | 🟡 Medium | Lookup-heavy workloads |
| **Red-Black** | O(log n) worst | ≤ 3 rotations | 🔴 Complex | `std::map`, Linux kernel |
| **Splay** | Amortized O(log n) | - | 🟢 Simple | Cache-like access patterns |

The key Treap advantage: **split/merge in O(log n)**. This unlocks implicit treaps (key = position, not value) for powerful range-reversal / range-assignment problems — classic competitive-programming use cases.

---

## ⚠️ Common Pitfalls

1. **Weak randomness = adversarial input risk.** Python's `random.random()` is fine for non-adversarial contexts. For CTF/contest inputs that could be adversarial, seed with `os.urandom` or `time.time_ns()`.
2. **Integer overflow on priority comparisons.** In C++, `rand()` returns a small int; combine two `rand()` calls or use `mt19937` for 32-bit priorities.
3. **Equal-key handling**: decide insert semantics up front — reject duplicates, store counts, or allow multiple. The rotation code breaks in different ways if you leave this ambiguous.
4. **Rotate in the wrong direction**. Right-rotate promotes left child; left-rotate promotes right child. Getting the direction wrong silently breaks BST order. Test inorder traversal after every operation.
5. **Forgetting to update subtree metadata** (size, min, max, sum) after rotations and splits. Augmented treaps rely on these — and they're broken if any operation forgets.

---

## 🔧 Implementations

| Language | Folder | Notes |
|----------|--------|-------|
| Python | [Python/](Python/) | Class-based; uses `random.random()` priorities |
| C++ | [C++/](C++/) | `std::mt19937` priorities, template-free `int` key demo |
| Go | [Go/](Go/) | `math/rand` priorities; iterative / recursive hybrid |

---

## 📝 Practice Problems

- [Codeforces 702F. T-shirts](https://codeforces.com/problemset/problem/702/F) — classic treap problem
- [SPOJ ORDERSET](https://www.spoj.com/problems/ORDERSET/) — order-statistic set using treap
- [Codeforces 455D. Serega and Fun](https://codeforces.com/problemset/problem/455/D) — implicit treap with range shift
- [HackerEarth — Balanced BST Problems](https://www.hackerearth.com/practice/data-structures/advanced-data-structures/avl-tree/practice-problems/)

---

## 🔗 Related

- [Binary Search Tree](../Binary%20Search%20Tree/README.md) — the unbalanced ancestor
- [AVL Tree](../AVL%20Tree/README.md) — deterministic balanced sibling
- [Red-Black Tree](../Red-Black%20Tree/README.md) — another deterministic balanced BST
- [Heap](../../Heaps/README.md) — the heap-priority half of "tree + heap"

---

_Part of [Non-Linear Data Structures — Trees](../README.md)._
