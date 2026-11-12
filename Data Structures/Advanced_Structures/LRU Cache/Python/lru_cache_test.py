"""
Test suite for LRU Cache data structure.
"""

import unittest
from lru_cache import LRUCache


class TestBasicGetPut(unittest.TestCase):

    def test_put_and_get(self):
        cache = LRUCache(2)
        cache.put(1, 10)
        cache.put(2, 20)
        self.assertEqual(cache.get(1), 10)
        self.assertEqual(cache.get(2), 20)

    def test_get_nonexistent_key(self):
        cache = LRUCache(2)
        self.assertEqual(cache.get(99), -1)

    def test_get_nonexistent_after_puts(self):
        cache = LRUCache(2)
        cache.put(1, 10)
        self.assertEqual(cache.get(5), -1)


class TestEviction(unittest.TestCase):

    def test_evicts_lru_when_capacity_exceeded(self):
        cache = LRUCache(2)
        cache.put(1, 10)
        cache.put(2, 20)
        cache.put(3, 30)  # evicts key 1
        self.assertEqual(cache.get(1), -1)
        self.assertEqual(cache.get(2), 20)
        self.assertEqual(cache.get(3), 30)

    def test_multiple_evictions(self):
        cache = LRUCache(2)
        cache.put(1, 10)
        cache.put(2, 20)
        cache.put(3, 30)  # evicts key 1
        cache.put(4, 40)  # evicts key 2
        self.assertEqual(cache.get(1), -1)
        self.assertEqual(cache.get(2), -1)
        self.assertEqual(cache.get(3), 30)
        self.assertEqual(cache.get(4), 40)

    def test_eviction_respects_access_order(self):
        cache = LRUCache(2)
        cache.put(1, 10)
        cache.put(2, 20)
        cache.get(1)       # 1 is now most recently used
        cache.put(3, 30)   # evicts key 2 (LRU), not key 1
        self.assertEqual(cache.get(1), 10)
        self.assertEqual(cache.get(2), -1)
        self.assertEqual(cache.get(3), 30)


class TestUpdateExistingKey(unittest.TestCase):

    def test_update_value(self):
        cache = LRUCache(2)
        cache.put(1, 10)
        cache.put(1, 100)
        self.assertEqual(cache.get(1), 100)

    def test_update_moves_to_front(self):
        cache = LRUCache(2)
        cache.put(1, 10)
        cache.put(2, 20)
        cache.put(1, 100)  # updates key 1, moves it to front
        cache.put(3, 30)   # should evict key 2 (LRU), not key 1
        self.assertEqual(cache.get(1), 100)
        self.assertEqual(cache.get(2), -1)
        self.assertEqual(cache.get(3), 30)

    def test_update_does_not_change_size(self):
        cache = LRUCache(2)
        cache.put(1, 10)
        cache.put(2, 20)
        self.assertEqual(cache.size, 2)
        cache.put(1, 100)
        self.assertEqual(cache.size, 2)


class TestGetMovesToFront(unittest.TestCase):

    def test_get_prevents_eviction(self):
        cache = LRUCache(3)
        cache.put(1, 10)
        cache.put(2, 20)
        cache.put(3, 30)
        cache.get(1)        # 1 is now most recently used
        cache.put(4, 40)    # evicts key 2
        self.assertEqual(cache.get(1), 10)
        self.assertEqual(cache.get(2), -1)

    def test_get_reorders_correctly(self):
        cache = LRUCache(3)
        cache.put(1, 10)
        cache.put(2, 20)
        cache.put(3, 30)
        cache.get(1)        # order: 1, 3, 2
        cache.get(2)        # order: 2, 1, 3
        cache.put(4, 40)    # evicts key 3
        self.assertEqual(cache.get(3), -1)
        self.assertEqual(cache.get(1), 10)
        self.assertEqual(cache.get(2), 20)
        self.assertEqual(cache.get(4), 40)


class TestCapacityOne(unittest.TestCase):

    def test_single_entry(self):
        cache = LRUCache(1)
        cache.put(1, 10)
        self.assertEqual(cache.get(1), 10)

    def test_evicts_immediately(self):
        cache = LRUCache(1)
        cache.put(1, 10)
        cache.put(2, 20)  # evicts key 1
        self.assertEqual(cache.get(1), -1)
        self.assertEqual(cache.get(2), 20)

    def test_update_in_place(self):
        cache = LRUCache(1)
        cache.put(1, 10)
        cache.put(1, 100)
        self.assertEqual(cache.get(1), 100)
        self.assertEqual(cache.size, 1)


class TestSizeProperty(unittest.TestCase):

    def test_size_grows(self):
        cache = LRUCache(3)
        self.assertEqual(cache.size, 0)
        cache.put(1, 10)
        self.assertEqual(cache.size, 1)
        cache.put(2, 20)
        self.assertEqual(cache.size, 2)
        cache.put(3, 30)
        self.assertEqual(cache.size, 3)

    def test_size_does_not_exceed_capacity(self):
        cache = LRUCache(2)
        cache.put(1, 10)
        cache.put(2, 20)
        cache.put(3, 30)
        self.assertEqual(cache.size, 2)

    def test_capacity_zero_and_negative_store_nothing(self):
        for cap in (0, -1):
            cache = LRUCache(cap)
            cache.put(1, 10)
            self.assertEqual(cache.size, 0)
            self.assertEqual(cache.get(1), -1)


if __name__ == "__main__":
    unittest.main()
