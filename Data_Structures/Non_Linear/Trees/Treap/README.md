# Treap (Randomized BST)

A treap is a binary search tree on keys that is also a max-heap on random priorities. Random priorities make the tree shape that of a BST built from keys in random order, so search, insert and delete take expected O(log n). This folder builds the treap from two small operations, split and merge.

## Intuition

Insert the same keys into a plain BST in a random order and the tree is balanced with high probability. A treap simulates that: every node gets a random priority when it is created, and the tree must be a BST by key and a max-heap by priority (a parent's priority is at least its children's).

Given the keys and priorities, that tree is unique: the node with the highest priority is the root, the keys below it go left, the keys above it go right, and so on recursively. Since priorities are random, it is the same tree as a random-order BST, with expected height O(log n).

## Visual

Keys are in the BST order left to right, priorities decrease downward (shown as `key:priority`):

```text
          5:0.9
         /     \
     2:0.6     6:0.7
                    \
                   8:0.4
```

Inserting 6 (priority 0.7) into the treap `5:0.9 (left 2:0.6, right 8:0.4)`: split at key 6 gives `{2, 5}` and `{8}`; merging `{2, 5}` with the node 6 attaches it under 5 (0.9 > 0.7), then merging with `{8}` puts 8 under 6 (0.7 > 0.4). The result is the tree above.

## Operations

The implementations use split and merge, not rotations.

| Operation | Description | Expected time |
| --------- | ----------- | ------------- |
| `split(t, k)` | cut `t` into keys `< k` and keys `>= k` | O(log n) |
| `merge(a, b)` | join two treaps where every key of `a` is smaller than every key of `b`; the higher priority becomes the root | O(log n) |
| `insert(key)` | reject duplicates; split at `key`; merge `left`, the new node and `right` | O(log n) |
| `delete(key)` | split at `key`; the minimum of the right part is the key itself, so drop it; merge the rest | O(log n) |
| `contains(key)` | ordinary BST search | O(log n) |
| inorder | sorted keys | O(n) |
| heap check | diagnostic: priorities obey the heap rule | O(n) |

Duplicate keys are rejected: `insert` returns false (or `False`) when the key is already present, and `delete` returns false when it is absent.

### Split (by key k)

If the root's key is `< k`, the root and its left subtree belong to the left result, so split the right subtree and hang its left part under the root. Otherwise mirror that. It follows one root-to-leaf path.

### Merge (a, b)

Compare the roots. The one with the higher priority stays the root. If it is `a`, merge `a.right` with `b`; otherwise merge `a` with `b.left`. It follows one path as well.

## Step-by-Step Trace

Start with keys 5, 2, 8 and priorities 0.9, 0.6, 0.4 (5 root; 2 and 8 below). Priorities fixed by hand for the trace; real code draws them at random.

| Step | Result |
| ---- | ------ |
| insert 6 with priority 0.7 | `split` gives `{2,5}` and `{8}`. `merge({2,5}, 6)` puts 6 under 5. `merge(that, {8})` puts 8 under 6. Tree: 5 root, children 2 and 6, and 8 under 6. |
| delete 5 | `split` at 5 gives `{2}` and `{5,6,8}`. Dropping the minimum of the right part removes 5 and leaves 6 (with 8 under it). `merge({2}, {6,8})`: 6 has the higher priority, so it is the root with 2 on the left and 8 on the right. |

## Complexity

| Operation | Expected | Worst case |
| --------- | -------- | ---------- |
| search, insert, delete, split, merge | O(log n) | O(n), exponentially unlikely |
| space | O(n) | recursion depth equals the tree height |

The worst case needs an unlucky run of priorities. The priorities are drawn by the program, so an adversary who only controls the keys cannot force it.

## When to Use

- You want a balanced BST with short code, especially if you need split and merge (range operations, implicit treaps).
- Randomness is acceptable.
- Avoid it when you need a deterministic worst-case bound (use an AVL or red-black tree).

## Treap vs. Alternatives

| Tree | Balance guarantee | Rebalancing | Code size |
| ---- | ----------------- | ----------- | --------- |
| Treap | expected O(log n) | split and merge (or expected O(1) rotations) | small |
| AVL tree | worst-case O(log n) | rotations, may be O(log n) per delete | medium |
| Red-black tree | worst-case O(log n) | at most 2 rotations per insert, 3 per delete | large |
| Splay tree | amortized O(log n) | rotates on every access | small |

## Common Pitfalls

- Computing `key + 1` to split off a single key: it overflows at the largest integer and is meaningless for non-integer keys. These implementations drop the minimum of the right part instead.
- Weak or reused randomness: use a good generator (C++ uses `std::mt19937` seeded from `std::random_device`).
- Deciding the duplicate policy late: this code rejects duplicates.
- Forgetting subtree data (size, sum) when you augment the treap: update it after every split and merge.
- Recursion depth: split and merge recurse down one path, which is fine for a random treap but would not be for a degenerate one.

## Implementations

| Language | Folder | Main file | Notes |
| -------- | ------ | --------- | ----- |
| Python | [Python](Python/) | `treap.py` | `random.random()` priorities; `len`, `in` |
| C++ | [C++](C++/) | `treap.h` | `std::mt19937` priorities, `unique_ptr` nodes |
| Go | [Go](Go/) | `main.go` | `math/rand` priorities, `Len`, `Contains` |

## Practice Problems

- [Cut and Paste (CSES 2072)](https://cses.fi/problemset/task/2072) (implicit treap)
- [Order statistic set (SPOJ ORDERSET)](https://www.spoj.com/problems/ORDERSET/) (order-statistic set)
- [Substring Reversals (CSES 2073)](https://cses.fi/problemset/task/2073) (implicit treap with a lazy flag)
- [T-Shirts (Codeforces 702F)](https://codeforces.com/problemset/problem/702/F)
- [Serega and Fun (Codeforces 455D)](https://codeforces.com/problemset/problem/455/D) (implicit treap)

## Related

- [Binary Search Tree](../Binary_Search_Tree/)
- [AVL Tree](../AVL_Tree/)
- [Red-Black Tree](../Red_Black_Tree/)
- [Cartesian Tree](../Cartesian_Tree/) (a treap is a Cartesian tree on key and priority)
- [Max Heap](../../Heaps/Max_Heap/)
