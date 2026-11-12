"""Treap: a randomized self-balancing BST.

Each node carries a key (ordered as a BST) and a uniformly random priority
(ordered as a max-heap). Expected height: O(log n).

This implementation uses the split/merge formulation, which is the cleanest
way to support insert/delete + range operations in ~30 lines.
"""

import random
from typing import Optional, Tuple


class _Node:
    __slots__ = ("key", "priority", "left", "right")

    def __init__(self, key: int) -> None:
        self.key = key
        self.priority = random.random()
        self.left: Optional["_Node"] = None
        self.right: Optional["_Node"] = None


def _split(node: Optional[_Node], key: int) -> Tuple[Optional[_Node], Optional[_Node]]:
    """Split `node` into (left, right) where left.keys < key <= right.keys."""
    if node is None:
        return None, None
    if node.key < key:
        left, right = _split(node.right, key)
        node.right = left
        return node, right
    else:
        left, right = _split(node.left, key)
        node.left = right
        return left, node


def _drop_min(node: _Node) -> Optional[_Node]:
    """Remove the smallest key of a non-empty treap and return the new root."""
    if node.left is None:
        return node.right
    node.left = _drop_min(node.left)
    return node


def _merge(a: Optional[_Node], b: Optional[_Node]) -> Optional[_Node]:
    """Merge two treaps with a.keys < b.keys into one."""
    if a is None:
        return b
    if b is None:
        return a
    if a.priority > b.priority:
        a.right = _merge(a.right, b)
        return a
    else:
        b.left = _merge(a, b.left)
        return b


class Treap:
    """A randomized self-balancing BST supporting insert / delete / contains."""

    def __init__(self) -> None:
        self._root: Optional[_Node] = None
        self._size = 0

    def __len__(self) -> int:
        return self._size

    def __contains__(self, key: int) -> bool:
        node = self._root
        while node is not None:
            if node.key == key:
                return True
            node = node.left if key < node.key else node.right
        return False

    def insert(self, key: int) -> bool:
        """Insert key; return True if inserted, False if key already present."""
        if key in self:
            return False
        new_node = _Node(key)
        left, right = _split(self._root, key)
        self._root = _merge(_merge(left, new_node), right)
        self._size += 1
        return True

    def delete(self, key: int) -> bool:
        """Delete key; return True if present and removed."""
        if key not in self:
            return False
        # `rest` holds the keys >= key, and key is present, so key is its minimum.
        # Dropping the minimum avoids computing key + 1 (overflow-prone, and
        # meaningless for non-integer keys).
        left, rest = _split(self._root, key)
        self._root = _merge(left, _drop_min(rest))
        self._size -= 1
        return True

    def inorder(self) -> list:
        """Return keys in sorted order (validates BST invariant)."""
        result: list = []

        def walk(node: Optional[_Node]) -> None:
            if node is None:
                return
            walk(node.left)
            result.append(node.key)
            walk(node.right)

        walk(self._root)
        return result

    def check_heap_property(self) -> bool:
        """Return True if heap-priority property holds (diagnostic)."""
        def walk(node: Optional[_Node]) -> bool:
            if node is None:
                return True
            if node.left and node.left.priority > node.priority:
                return False
            if node.right and node.right.priority > node.priority:
                return False
            return walk(node.left) and walk(node.right)
        return walk(self._root)


if __name__ == "__main__":
    t = Treap()
    for k in [5, 3, 7, 1, 9, 4, 6, 2, 8]:
        t.insert(k)
    print(f"Inorder (should be sorted): {t.inorder()}")
    print(f"Heap property holds: {t.check_heap_property()}")
    t.delete(5)
    print(f"After delete 5: {t.inorder()}")
