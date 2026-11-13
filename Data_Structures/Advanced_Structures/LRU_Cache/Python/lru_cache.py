"""
LRU (Least Recently Used) Cache

A fixed-capacity cache that evicts the least recently used entry when full.
Combines a hash map with a doubly linked list to achieve O(1) get and put.
"""

from typing import Dict, Optional


class Node:
    """Doubly linked list node storing a key-value pair."""

    __slots__ = ("key", "value", "prev", "next")

    def __init__(self, key: int = 0, value: int = 0):
        self.key = key
        self.value = value
        self.prev: Optional["Node"] = None
        self.next: Optional["Node"] = None


class LRUCache:
    """
    LRU Cache with O(1) get and put operations.

    Uses a hash map for key lookup and a doubly linked list to track
    access order. The most recently used item is at the front (right
    after the sentinel head); the least recently used is at the back
    (right before the sentinel tail).
    """

    def __init__(self, capacity: int):
        """
        Initialize the cache with a fixed capacity.

        Args:
            capacity: Maximum number of key-value pairs the cache can hold.

        Time:  O(1)
        Space: O(capacity)
        """
        self.capacity = capacity
        self.cache: Dict[int, Node] = {}

        # Sentinel nodes simplify edge-case handling.
        self._head = Node()
        self._tail = Node()
        self._head.next = self._tail
        self._tail.prev = self._head

    def get(self, key: int) -> int:
        """
        Return the value for *key*, or -1 if not present.

        Accessing a key marks it as the most recently used.

        Args:
            key: The key to look up.

        Returns:
            The associated value, or -1 if the key is not in the cache.

        Time: O(1)
        """
        if key not in self.cache:
            return -1

        node = self.cache[key]
        self._remove(node)
        self._add_to_front(node)
        return node.value

    def put(self, key: int, value: int) -> None:
        """
        Insert or update the key-value pair.

        If the key already exists, its value is updated and it becomes the
        most recently used. If the cache is at capacity and a new key is
        inserted, the least recently used entry is evicted.

        Args:
            key:   The key.
            value: The value.

        Time: O(1)
        """
        if key in self.cache:
            node = self.cache[key]
            node.value = value
            self._remove(node)
            self._add_to_front(node)
            return

        node = Node(key, value)
        self.cache[key] = node
        self._add_to_front(node)

        if len(self.cache) > self.capacity:
            lru = self._tail.prev
            self._remove(lru)
            del self.cache[lru.key]

    @property
    def size(self) -> int:
        """Return the current number of entries in the cache."""
        return len(self.cache)

    # ---- internal helpers ------------------------------------------------

    def _remove(self, node: Node) -> None:
        """
        Remove *node* from its current position in the doubly linked list.

        Time: O(1)
        """
        node.prev.next = node.next
        node.next.prev = node.prev

    def _add_to_front(self, node: Node) -> None:
        """
        Insert *node* right after the sentinel head (most recently used).

        Time: O(1)
        """
        node.prev = self._head
        node.next = self._head.next
        self._head.next.prev = node
        self._head.next = node


if __name__ == "__main__":
    cache = LRUCache(3)
    cache.put(1, 10)
    cache.put(2, 20)
    cache.put(3, 30)
    print(f"get(1) = {cache.get(1)}")   # 10
    cache.put(4, 40)                     # evicts key 2
    print(f"get(2) = {cache.get(2)}")   # -1
    print(f"get(3) = {cache.get(3)}")   # 30
    print(f"size   = {cache.size}")      # 3
