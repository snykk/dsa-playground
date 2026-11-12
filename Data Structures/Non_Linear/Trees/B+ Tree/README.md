# B+ Tree

A B+ tree is a B-tree variant that stores every key and value in its leaves and links the leaves into a sorted list. Point lookups take O(log n); a range query is one descent plus a walk along the leaf chain, O(log n + k).

## Intuition

Take a B-tree and move all the data to the bottom. Internal nodes become pure signposts: separator keys that say "keys below this one go left, the rest go right". Because signposts carry no values, they are small, so each internal node fits more of them and the tree stays shallow. The leaves are chained, so once you reach the first key of a range you just keep walking right.

Invariants (minimum degree `t >= 2`, default 3):

- Every node except the root has `t - 1` to `2t - 1` keys; all leaves share one depth.
- Leaves hold the (key, value) pairs and a `next` pointer.
- Each separator equals the smallest key of the subtree to its right (copy-up), so a key can appear in an internal node and in a leaf.

## Visual

A `t = 2` tree after inserting 10, 20, ..., 90 (values omitted):

```text
                    [ 30 | 50 ]
                  /      |       \
            [ 20 ]     [ 40 ]     [ 60 | 70 ]
            /    \     /    \     /     |      \
        [10]->[20]->[30]->[40]->[50]->[60]->[70 80 90]
```

The bottom row is the leaf chain. Keys 20 to 70 appear both as separators and in leaves.

## Operations

| Operation | What it does | Time |
| --------- | ------------ | ---- |
| `search(key)` | descend to the single leaf that could hold the key | O(log n) |
| `insert(key, value)` | split full nodes on the way down; an existing key is overwritten (map semantics) | O(log n) |
| `range_search(lo, hi)` | find the leaf for `lo`, follow `next` until a key exceeds `hi` | O(log n + k) |
| `traverse()` | walk the leaf chain from the leftmost leaf | O(n) |

Delete is not implemented in any language.

### Insert: copy-up and push-up

- Leaf split: the upper half (from index `t - 1`) moves to a new leaf, the chain is relinked, and the new leaf's first key is copied into the parent.
- Internal split: the median separator moves up into the parent and stays in neither half.

### Search rule

At an internal node go to the child to the right of every separator `<=` key (equal keys go right). Always continue to a leaf: the value only lives there.

## Step-by-Step Trace

Insert `1` to `8` into a `t = 3` tree, then run `range_search(2, 5)`.

| Step | Tree after the step | Note |
| ---- | ------------------- | ---- |
| insert 1..5 | `[1 2 3 4 5]` | one full leaf |
| insert 6 | `[3]` over `[1 2]`, `[3 4 5 6]` | leaf split, 3 copied up |
| insert 7 | `[3]` over `[1 2]`, `[3 4 5 6 7]` | |
| insert 8 | `[3 5]` over `[1 2]`, `[3 4]`, `[5 6 7 8]` | leaf split, 5 copied up |
| `range_search(2, 5)` | keys 2, 3, 4, 5 | descend 2 < 3 to `[1 2]`, take 2, hop to `[3 4]`, take 3 and 4, hop to `[5 6 7 8]`, take 5, then 6 > 5 stops |

(The tree states come from running the Python implementation.)

## Complexity

| Operation | Node reads | Note |
| --------- | ---------- | ---- |
| search | O(log<sub>t</sub> n) | one root-to-leaf path |
| insert | O(log<sub>t</sub> n) | one extra descent to check for an existing key; a split costs O(t) |
| range query | O(log<sub>t</sub> n + k / t) | one descent, then sequential leaf reads |
| traverse | O(n / t) | leaf chain only |

Each node visit costs O(t) comparisons because the scan inside a node is linear. Space is O(n).

## When to Use

- Ordered data with range queries (`BETWEEN`, `ORDER BY` style scans) on block storage.
- Not a good fit when you need `delete` from this repository (not implemented) or only exact-match lookups (a hash table is simpler).

## B+ Tree vs. B-Tree

| Aspect | B+ tree | B-tree |
| ------ | ------- | ------ |
| Data location | leaves only | every node |
| Point lookup | always reaches a leaf | can stop at an internal node |
| Range scan | follow the leaf chain | in-order traversal through internal nodes |
| Internal nodes | keys only, higher fan-out | keys and values |

## Common Pitfalls

- Moving the first key of a split leaf up instead of copying it: the key would vanish from the leaf.
- Stopping a search at an equal separator; the value is in the leaf (equal keys go right).
- Not relinking `next` after a leaf split.
- Seeding the leftmost-leaf search with `-inf`; it fails for non-numeric keys. Follow `children[0]`.
- C++ and Go `search` return `""` for both a missing key and a stored empty value.
- Inserting an existing key overwrites the value instead of adding a second entry.

## Implementations

| Language | Folder | Main file | Notes |
| -------- | ------ | --------- | ----- |
| Python | `Python/` | `b_plus_tree.py` | `search` returns the value or `None` |
| C++ | `C++/` | `b_plus_tree.cpp` | string values; owns its nodes (destructor), not copyable; `range_search`, `traverse`, `validate` |
| Go | `Go/` | `main.go` | string values; `RangeSearch` and `Traverse` return `[]KeyValue` |

All three are tested against a dictionary or `std::map` on thousands of random inserts, with a check of fill bounds, separators, leaf depth and the leaf chain.

## Practice Problems

- Add `delete` (borrow and merge in leaves and internal nodes, updating separators).
- Add a `prev` pointer to the leaves and a reverse range scan.
- Add a `floor(key)` query (largest key `<=` key) using one descent.
- Bulk-load a tree from sorted input by filling leaves left to right.

## Related

- [B-Tree](../B-Tree/README.md)
- [Binary Search Tree](../Binary%20Search%20Tree/README.md)
- [AVL Tree](../AVL%20Tree/README.md)
