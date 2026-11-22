# Rope

A rope stores a long string as a balanced binary tree of short fragments. Concatenating, splitting, inserting and deleting rebuild only a path through the tree, so they take O(log n) instead of copying the whole text; the price is O(log n) indexing instead of O(1).

## Intuition

Editing the middle of a flat string moves every later character. A rope cuts the text into fragments kept in the leaves of a tree, so an edit rewires a few nodes and shares the rest. Each internal node stores a `weight`, the number of characters in its left subtree, which plays the role of a search key: to find position `i`, go left if `i < weight`, otherwise go right with `i - weight`.

Invariants (checked by the tests): a leaf holds a non-empty fragment; an internal node's `weight` is the length of its left subtree; every node caches its total `length` and `height`; sibling heights differ by at most 1. The last point is what keeps all operations logarithmic.

## Visual

```text
Rope for "Hello, World! Nice to meet you!" (31 chars, _ = space), built by the constructor:

                   [15]                    weight = length of left subtree
                 /      \
            [7]             [8]
           /   \           /   \
    "Hello,_" "World!_N" "ice_to_m" "eet_you!"

index(20): 20 >= 15 -> right, i = 5; 5 < 8 -> left; leaf "ice_to_m"[5] = 'o'
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `index(i)` | follow the weights from the root to the leaf with position `i` | O(log n) |
| `concat(other)` | join two ropes into a new one (AVL-style join); sources unchanged | O(log n) |
| `split(i)` | two new ropes: before `i` and from `i` | O(log n) |
| `insert(i, text)` | split at `i`, build a rope from `text`, join the three | O(log n + len(text)) |
| `delete(i, length)` | split at `i`, split the rest at `length`, join the outer two | O(log n) |
| `to_string()` | read all leaves in order | O(n) |
| length | cached in the root | O(1) |

Names: `index`, `concat`, `split`, `insert`, `delete`, `to_string`, `len(r)`, `height()` (Python); `index`, `concat`, `split`, `insert`, `deleteStr`, `toString`, `length()`, `height()` (C++); `Index`, `Concat`, `Split`, `Insert`, `Delete`, `ToString`, `Len()`, `Height()` (Go). `Index` in Go returns `(byte, error)`; Python raises `IndexError` and C++ throws `std::out_of_range`. Split and insert positions outside the string are clamped.

### Split

At an internal node: if `i < weight`, split the left child and join the right piece with the node's right child; if `i > weight`, split the right child (with `i - weight`) and join the left child with the left piece; if `i == weight`, return the two children. At a leaf, return it whole or cut it into two shorter leaves.

### Join (keeps the tree balanced)

If the two heights differ by at most 1, make a new root. Otherwise walk down the taller rope's facing spine until the heights match, attach the other rope there, and fix any node left two levels out of balance with a single or double rotation on the way back. Rotations regroup subtrees but never reorder leaves.

## Step-by-Step Trace

`insert(5, ",")` on `Hello World!` (root weight 6 over leaves `Hello_` and `World!`):

| Step | Result |
| --- | --- |
| `split(5)` | the leaf `Hello_` is cut into `Hello` and `_`; left part `Hello`; right part is `_` joined with `World!` |
| build the middle | a leaf `,` |
| join left and middle | node (weight 5, height 1) over `Hello` and `,` |
| join with the right part | both sides have height 1, so a new root (weight 6, height 2) |

Result: `Hello,_World!`, 13 characters, with weights 6, 5 and 1.

## Complexity

| Operation | Time | Why |
| --- | --- | --- |
| index | O(log n) | one node per level |
| concat | O(log n) | walks one spine, at most the height difference |
| split | O(log n) | one root-to-leaf path with a join per level |
| insert, delete | O(log n) | a constant number of splits and joins (plus O(len) to build inserted text) |
| length | O(1) | cached |
| to_string | O(n) | visits every leaf |

Space is O(n) plus about one internal node per fragment. Because siblings differ in height by at most 1, the height is at most about 1.44 log2(n), as in an AVL tree. In a test of one-character appends at the end, the height was 10 after 1,000 appends and 14 after 10,000. Splits can leave leaves shorter than 10 characters, which raises per-character overhead.

## When to Use

Use a rope for large texts with many scattered edits, concatenations or splits, or when you want cheap snapshots (old ropes stay valid). Do not use it for short strings (a flat string is faster), for index-heavy code, or when a single cursor makes a gap buffer enough.

## Rope vs. Alternatives

| Structure | Edit in the middle | Index | Notes |
| --- | --- | --- | --- |
| Flat string | O(n) | O(1) | fastest to read |
| Rope | O(log n) | O(log n) | cheap concat and split, persistent |
| Gap buffer | O(1) near the cursor | O(1) | one cursor only |
| Piece table | O(pieces) | O(pieces) | append-only buffers, cheap undo |

Ropes are used in editors such as xi-editor, Zed and Helix (through the `ropey` library). Some editors use other structures, such as piece tables.

## Common Pitfalls

- Not rebalancing: joining under a new root each time builds a chain. An earlier version of this code did, and after about 1,000 appends Python hit `RecursionError`.
- Forgetting that `weight` is the left subtree only; going right subtracts it.
- Mixing units: Python indexes code points, C++ and Go index bytes, so a Go `Split` can cut inside a multi-byte character.
- Many tiny leaves after repeated splits.
- Using a rope where a flat string would do.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [`Python/`](Python) | `rope.py` | code-point positions; `RopeNode`, `Rope` |
| C++ | [`C++/`](C++) | `rope.cpp` | `shared_ptr` nodes; byte positions; `deleteStr` |
| Go | [`Go/`](Go) | `main.go` | exported `RopeNode`, `Rope`; byte positions |

## Practice Problems

- [Design a Text Editor (LeetCode 2296)](https://leetcode.com/problems/design-a-text-editor/)
- [List Removals (CSES 1749)](https://cses.fi/problemset/task/1749)
- [Cut and Paste (CSES 2072)](https://cses.fi/problemset/task/2072)
- [Substring Reversals (CSES 2073)](https://cses.fi/problemset/task/2073)

## Related

- [String Manipulation](../String_Manipulation)
- [Introduction to Strings](../String_Basics)
- [Treap](../../../Non_Linear/Trees/Treap)
- [AVL Tree](../../../Non_Linear/Trees/AVL_Tree)
