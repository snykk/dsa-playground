"""Unit tests for LFU Cache."""
import unittest

from lfu_cache import LFUCache


class TestLFUCache(unittest.TestCase):
    def test_miss_returns_minus_one(self):
        cache = LFUCache(2)
        self.assertEqual(cache.get(1), -1)

    def test_basic_put_get(self):
        cache = LFUCache(2)
        cache.put(1, 10)
        cache.put(2, 20)
        self.assertEqual(cache.get(1), 10)
        self.assertEqual(cache.get(2), 20)

    def test_eviction_least_frequent_first(self):
        cache = LFUCache(2)
        cache.put(1, 10)
        cache.put(2, 20)
        cache.get(1)          # freq(1)=2, freq(2)=1
        cache.put(3, 30)      # evicts 2 (lowest freq)
        self.assertEqual(cache.get(2), -1)
        self.assertEqual(cache.get(1), 10)
        self.assertEqual(cache.get(3), 30)

    def test_eviction_tie_broken_by_lru(self):
        cache = LFUCache(2)
        cache.put(1, 10)
        cache.put(2, 20)
        # Both have freq 1. 1 was inserted first -> it's LRU on a tie.
        cache.put(3, 30)
        self.assertEqual(cache.get(1), -1)
        self.assertEqual(cache.get(2), 20)
        self.assertEqual(cache.get(3), 30)

    def test_update_value_does_not_evict(self):
        cache = LFUCache(2)
        cache.put(1, 10)
        cache.put(2, 20)
        cache.put(1, 100)     # update, should not evict anything
        self.assertEqual(cache.get(1), 100)
        self.assertEqual(cache.get(2), 20)

    def test_update_value_promotes_frequency(self):
        cache = LFUCache(2)
        cache.put(1, 10)
        cache.put(2, 20)
        cache.put(1, 100)     # freq(1)=2, freq(2)=1
        cache.put(3, 30)      # evicts 2
        self.assertEqual(cache.get(2), -1)
        self.assertEqual(cache.get(1), 100)

    def test_capacity_zero_is_noop(self):
        cache = LFUCache(0)
        cache.put(1, 10)
        self.assertEqual(cache.get(1), -1)

    def test_capacity_one(self):
        cache = LFUCache(1)
        cache.put(1, 10)
        self.assertEqual(cache.get(1), 10)
        cache.put(2, 20)
        self.assertEqual(cache.get(1), -1)
        self.assertEqual(cache.get(2), 20)

    def test_leetcode_official_trace(self):
        # From LeetCode 460 problem statement.
        cache = LFUCache(2)
        cache.put(1, 1)
        cache.put(2, 2)
        self.assertEqual(cache.get(1), 1)       # returns 1
        cache.put(3, 3)                          # evicts 2
        self.assertEqual(cache.get(2), -1)      # miss
        self.assertEqual(cache.get(3), 3)       # returns 3
        cache.put(4, 4)                          # evicts 1 (freq 2 vs freq 2; 1 is LRU)
        self.assertEqual(cache.get(1), -1)
        self.assertEqual(cache.get(3), 3)
        self.assertEqual(cache.get(4), 4)

    def test_eviction_removes_empty_bucket(self):
        # Evicting the only key of a frequency bucket must delete the bucket.
        cache = LFUCache(1)
        cache.put(1, 10)
        cache.get(1)            # key 1 now lives in bucket freq=2
        cache.put(2, 20)        # evicts key 1, emptying bucket freq=2
        self.assertEqual(list(cache.freq_to_keys), [1])
        for k in range(3, 50):  # keep evicting keys with higher counts
            for _ in range(k % 5):
                cache.get(k - 1)
            cache.put(k, k)
        self.assertTrue(all(cache.freq_to_keys.values()))
        self.assertLessEqual(len(cache.freq_to_keys), 2)

    def test_invalid_capacity_raises(self):
        with self.assertRaises(ValueError):
            LFUCache(-1)


if __name__ == "__main__":
    unittest.main()
