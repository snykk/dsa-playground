"""
Test cases for Collision Handling
"""

import unittest
from collision_handling import (
    HashTableChaining,
    HashTableOpenAddressing,
    HashTableQuadraticProbing
)


class TestChaining(unittest.TestCase):
    
    def test_basic_operations(self):
        """Test basic operations with chaining"""
        table = HashTableChaining()
        table.put("apple", 5)
        table.put("banana", 10)
        
        self.assertEqual(table.get("apple"), 5)
        self.assertEqual(table.get("banana"), 10)
        
        self.assertTrue(table.remove("apple"))
        self.assertIsNone(table.get("apple"))


class TestChainingCollisions(unittest.TestCase):

    def test_colliding_keys_share_a_bucket(self):
        """Integer keys that are multiples of the capacity all hash to bucket 0"""
        table = HashTableChaining(8)
        for k in (0, 8, 16, 24):
            table.put(k, str(k))
        self.assertEqual(len(table.buckets[0]), 4)
        self.assertEqual(table.size, 4)
        self.assertEqual(table.get(16), "16")
        self.assertTrue(table.remove(8))
        self.assertIsNone(table.get(8))
        self.assertEqual(table.get(24), "24")
        table.put(24, "new")
        self.assertEqual(len(table.buckets[0]), 3)

    def test_invalid_capacity(self):
        with self.assertRaises(ValueError):
            HashTableChaining(0)


class TestOpenAddressing(unittest.TestCase):

    def test_probe_past_collision_and_tombstone(self):
        """1 and 17 share home slot 1; removing 1 leaves a tombstone that get must walk past"""
        table = HashTableOpenAddressing(16)
        table.put(1, "a")
        table.put(17, "b")
        self.assertEqual(table.buckets[2], (17, "b"))
        self.assertTrue(table.remove(1))
        self.assertEqual(table.get(17), "b")

    def test_reput_after_removing_an_earlier_collider(self):
        """put must find the existing key past the tombstone, not insert a duplicate"""
        table = HashTableOpenAddressing(16)
        table.put(1, "a")
        table.put(17, "b")
        table.remove(1)
        table.put(17, "B")
        self.assertEqual(table.size, 1)
        self.assertEqual(table.get(17), "B")
        self.assertTrue(table.remove(17))
        self.assertIsNone(table.get(17))
        self.assertEqual(table.size, 0)

    def test_full_table_raises_and_wraps_around(self):
        table = HashTableOpenAddressing(4)
        for k in (3, 7, 11, 15):  # all home at slot 3, so they wrap to 0, 1, 2
            table.put(k, k)
        self.assertEqual(table.size, 4)
        self.assertEqual([table.get(k) for k in (3, 7, 11, 15)], [3, 7, 11, 15])
        with self.assertRaises(Exception):
            table.put(19, 19)
        self.assertIsNone(table.get(19))
        table.put(7, "updated")  # updating a key in a full table is fine
        self.assertEqual(table.get(7), "updated")

    def test_removed_slot_is_reused(self):
        table = HashTableOpenAddressing(4)
        for k in (3, 7, 11, 15):
            table.put(k, k)
        table.remove(7)
        table.put(19, 19)  # reuses the tombstone
        self.assertEqual(table.size, 4)
        self.assertEqual(table.get(19), 19)

    def test_matches_dict_on_colliding_keys(self):
        import random
        rng = random.Random(7)
        table, ref = HashTableOpenAddressing(16), {}
        for _ in range(5000):
            k = rng.randrange(0, 12) * 8  # only two home slots
            r = rng.random()
            if r < 0.5:
                table.put(k, r)
                ref[k] = r
            elif r < 0.8:
                self.assertEqual(table.get(k), ref.get(k))
            else:
                self.assertEqual(table.remove(k), k in ref)
                ref.pop(k, None)
            self.assertEqual(table.size, len(ref))

    def test_invalid_capacity(self):
        with self.assertRaises(ValueError):
            HashTableOpenAddressing(0)

    
    def test_basic_operations(self):
        """Test basic operations with open addressing"""
        table = HashTableOpenAddressing()
        table.put("apple", 5)
        table.put("banana", 10)
        
        self.assertEqual(table.get("apple"), 5)
        self.assertEqual(table.get("banana"), 10)
        
        self.assertTrue(table.remove("apple"))
        self.assertIsNone(table.get("apple"))


class TestQuadraticProbing(unittest.TestCase):

    def test_fifth_colliding_key_in_power_of_two_table(self):
        """Plain i*i steps only reach 4 slots of 16, so the 5th key used to fail"""
        table = HashTableQuadraticProbing(16)
        keys = (0, 16, 32, 48, 64)
        for k in keys:
            table.put(k, k)
        self.assertEqual([table.get(k) for k in keys], list(keys))

    def test_table_fills_completely(self):
        table = HashTableQuadraticProbing(16)
        for k in range(0, 16 * 16, 16):  # all 16 keys share home slot 0
            table.put(k, k)
        self.assertEqual(table.size, 16)
        with self.assertRaises(Exception):
            table.put(999 * 16, 0)

    def test_remove_and_reput(self):
        table = HashTableQuadraticProbing(16)
        for k in (0, 16, 32):
            table.put(k, k)
        self.assertTrue(table.remove(0))
        self.assertEqual(table.get(32), 32)
        table.put(32, "x")
        self.assertEqual(table.size, 2)
        self.assertEqual(table.get(32), "x")
    
    def test_basic_operations(self):
        """Test basic operations with quadratic probing"""
        table = HashTableQuadraticProbing()
        table.put("apple", 5)
        table.put("banana", 10)
        
        self.assertEqual(table.get("apple"), 5)
        self.assertEqual(table.get("banana"), 10)


if __name__ == '__main__':
    unittest.main()

