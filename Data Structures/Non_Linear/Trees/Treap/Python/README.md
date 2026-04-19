# Treap — Python Implementation

A randomized self-balancing BST with expected O(log n) operations, built via the clean split/merge formulation.

For the conceptual overview, visuals, and comparison with AVL / Red-Black, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `treap.py` | `Treap` class with `insert`, `delete`, `__contains__`, `inorder`, `check_heap_property` |
| `treap_test.py` | Unit tests including a 1000-operation randomized stress test |

---

## Python-Specific Notes

- **`__slots__` on `_Node`**: cuts per-node memory by ~40 bytes. At 1M nodes, that's 40 MB saved. Worth it.
- **`random.random()` for priorities**: returns a float in `[0, 1)`. Collisions are theoretically possible but astronomically unlikely (`2⁻⁵³` per pair).
- **Split/merge over rotate**: split/merge is the "modern" treap formulation. It's 30 lines, handles insert/delete/union/intersect cleanly, and generalizes to implicit treaps (key = subtree size) for range operations.
- **Recursion**: `_split` and `_merge` are recursive. For very deep trees, Python's 1000-depth recursion limit can matter — use `sys.setrecursionlimit(10000)` or convert to iterative.
- **Dunder methods** (`__len__`, `__contains__`): make the Treap behave like a native Python collection. `if key in treap:` just works.

---

## How to Run

```bash
python3 -m unittest treap_test.py
```

---

## Key Takeaways for Learners

1. **Split + merge = the entire treap.** Insert is `merge(merge(left, new_node), right)`; delete is `merge(left_of_key, right_of_key)`. Every operation reduces to two lines once you have these primitives.
2. **Randomness replaces explicit balancing.** No rotations at insert time if you use split/merge. The priorities create the same tree shape as "insert in random order" — which is balanced in expectation.
3. **The `check_heap_property` helper is worth keeping.** When debugging, comparing `inorder()` against `sorted(expected)` verifies BST order, and `check_heap_property()` verifies the heap invariant. Between them, most treap bugs become visible.
