"""
Test cases for Hash Table
"""

import random
import unittest
from hash_table import HashTable


class TestHashTable(unittest.TestCase):
    
    def setUp(self):
        self.table = HashTable()
    
    def test_put_and_get(self):
        """Test basic put and get operations"""
        self.table.put("apple", 5)
        self.table.put("banana", 10)
        self.table.put("cherry", 15)
        
        self.assertEqual(self.table.get("apple"), 5)
        self.assertEqual(self.table.get("banana"), 10)
        self.assertEqual(self.table.get("cherry"), 15)
    
    def test_update_existing_key(self):
        """Test updating existing key"""
        self.table.put("apple", 5)
        self.table.put("apple", 10)
        
        self.assertEqual(self.table.get("apple"), 10)
        self.assertEqual(len(self.table), 1)
    
    def test_remove(self):
        """Test remove operation"""
        self.table.put("apple", 5)
        self.table.put("banana", 10)
        
        self.assertTrue(self.table.remove("apple"))
        self.assertIsNone(self.table.get("apple"))
        self.assertEqual(self.table.get("banana"), 10)
        self.assertEqual(len(self.table), 1)
        
        self.assertFalse(self.table.remove("nonexistent"))
    
    def test_contains(self):
        """Test contains method"""
        self.table.put("apple", 5)
        
        self.assertTrue(self.table.contains("apple"))
        self.assertFalse(self.table.contains("banana"))
        self.assertTrue("apple" in self.table)
        self.assertFalse("banana" in self.table)
    
    def test_keys_values_items(self):
        """Test keys, values, and items methods"""
        self.table.put("apple", 5)
        self.table.put("banana", 10)
        self.table.put("cherry", 15)
        
        keys = self.table.keys()
        self.assertEqual(len(keys), 3)
        self.assertIn("apple", keys)
        self.assertIn("banana", keys)
        self.assertIn("cherry", keys)
        
        values = self.table.values()
        self.assertEqual(len(values), 3)
        self.assertIn(5, values)
        self.assertIn(10, values)
        self.assertIn(15, values)
        
        items = self.table.items()
        self.assertEqual(len(items), 3)
        self.assertIn(("apple", 5), items)
    
    def test_clear(self):
        """Test clear operation"""
        self.table.put("apple", 5)
        self.table.put("banana", 10)
        
        self.table.clear()
        self.assertTrue(self.table.is_empty())
        self.assertEqual(len(self.table), 0)
        self.assertIsNone(self.table.get("apple"))
    
    def test_empty_table(self):
        """Test operations on empty table"""
        self.assertTrue(self.table.is_empty())
        self.assertEqual(len(self.table), 0)
        self.assertIsNone(self.table.get("key"))
        self.assertFalse(self.table.contains("key"))
        self.assertEqual(self.table.keys(), [])
    
    def test_dictionary_style_access(self):
        """Test dictionary-style access"""
        self.table["apple"] = 5
        self.assertEqual(self.table["apple"], 5)
        
        with self.assertRaises(KeyError):
            _ = self.table["nonexistent"]
        
        del self.table["apple"]
        with self.assertRaises(KeyError):
            _ = self.table["apple"]
    
    def test_integer_keys(self):
        """Test with integer keys"""
        self.table.put(1, "one")
        self.table.put(2, "two")
        self.table.put(3, "three")
        
        self.assertEqual(self.table.get(1), "one")
        self.assertEqual(self.table.get(2), "two")
        self.assertEqual(self.table.get(3), "three")
    
    def test_resize(self):
        """Test automatic resizing"""
        # Create table with small capacity
        small_table = HashTable(capacity=4)
        
        # Add enough items to trigger resize
        for i in range(10):
            small_table.put(f"key{i}", i)
        
        # Verify all items are still accessible
        for i in range(10):
            self.assertEqual(small_table.get(f"key{i}"), i)
        
        # Capacity should have increased
        self.assertGreater(small_table.capacity, 4)
    
    def test_collision_handling(self):
        """Test collision handling with chaining"""
        # Force collisions by using small capacity
        small_table = HashTable(capacity=2)
        
        small_table.put("a", 1)
        small_table.put("b", 2)
        small_table.put("c", 3)
        
        self.assertEqual(small_table.get("a"), 1)
        self.assertEqual(small_table.get("b"), 2)
        self.assertEqual(small_table.get("c"), 3)

    def test_chain_longer_than_one(self):
        """Keys that are multiples of the capacity share one bucket (no resize yet)"""
        table = HashTable(capacity=16)
        for k in (0, 16, 32, 48):
            table.put(k, k * 10)
        self.assertEqual(len(table.buckets[0]), 4)
        self.assertEqual(table.get(32), 320)
        self.assertTrue(table.remove(16))
        self.assertIsNone(table.get(16))
        self.assertEqual(table.get(48), 480)
        table.put(48, -1)
        self.assertEqual(len(table.buckets[0]), 3)
        self.assertEqual(table.get(48), -1)

    def test_resize_splits_a_chain(self):
        table = HashTable(capacity=4)
        for k in (0, 4, 8, 12):  # one chain of 4 at capacity 4; the 4th put resizes
            table.put(k, k)
        self.assertEqual(table.capacity, 8)
        self.assertEqual(sorted(table.keys()), [0, 4, 8, 12])
        self.assertLessEqual(max(len(b) for b in table.buckets), 2)

    def test_none_value_is_a_present_key(self):
        """contains used to be get(key) is not None, so a stored None looked absent"""
        table = HashTable()
        table.put("k", None)
        self.assertIn("k", table)
        self.assertTrue(table.contains("k"))
        self.assertEqual(len(table), 1)
        self.assertIsNone(table["k"])
        self.assertNotIn("missing", table)
        with self.assertRaises(KeyError):
            table["missing"]

    def test_invalid_capacity(self):
        for capacity in (0, -3):
            with self.assertRaises(ValueError):
                HashTable(capacity)

    def test_negative_int_keys(self):
        table = HashTable(capacity=4)
        for k in (-1, -4, -7):
            table.put(k, k)
        for k in (-1, -4, -7):
            self.assertEqual(table.get(k), k)

    def test_iteration_yields_pairs(self):
        self.table.put("apple", 5)
        self.table.put("banana", 10)
        items = list(self.table)
        self.assertEqual(len(items), 2)
        self.assertIn(("apple", 5), items)
        self.assertIn(("banana", 10), items)

    def test_repr(self):
        self.table.put("apple", 5)
        self.table.put("banana", 10)
        text = repr(self.table)
        self.assertIn("'apple': 5", text)
        self.assertIn("'banana': 10", text)

    def test_get_or_default(self):
        self.table.put("apple", 5)
        self.assertEqual(self.table.get_or_default("apple", 0), 5)
        self.assertEqual(self.table.get_or_default("nonexistent", 0), 0)

    def test_put_if_absent(self):
        self.assertTrue(self.table.put_if_absent("apple", 5))
        self.assertEqual(self.table.get("apple"), 5)
        self.assertFalse(self.table.put_if_absent("apple", 10))
        self.assertEqual(self.table.get("apple"), 5)

    def test_put_if_absent_with_none_value(self):
        """A key stored with value None is present; put_if_absent must not overwrite it."""
        self.assertTrue(self.table.put_if_absent("k", None))
        self.assertFalse(self.table.put_if_absent("k", 5))
        self.assertIsNone(self.table.get("k"))
        self.assertTrue(self.table.contains("k"))
        self.assertEqual(len(self.table), 1)

    def test_get_or_default_with_none_value(self):
        self.table.put("k", None)
        self.assertIsNone(self.table.get_or_default("k", 7))
        self.assertEqual(self.table.get_or_default("other", 7), 7)

    def test_update(self):
        self.table.put("apple", 5)
        self.table.update({"apple": 50, "banana": 10})
        self.assertEqual(self.table.get("apple"), 50)
        self.assertEqual(self.table.get("banana"), 10)
        other = HashTable()
        other.put("date", 20)
        self.table.update(other)
        self.assertEqual(self.table.get("date"), 20)
        self.assertEqual(len(self.table), 3)

    def test_copy_is_independent(self):
        self.table.put("apple", 5)
        self.table.put("banana", 10)
        copied = self.table.copy()
        self.assertEqual(copied.get("apple"), 5)
        self.assertEqual(copied.get("banana"), 10)
        self.table.put("apple", 20)
        self.assertEqual(copied.get("apple"), 5)

    def test_random_operations_match_dict(self):
        rng = random.Random(11)
        for _ in range(100):
            table = HashTable(rng.choice([1, 2, 16]))
            reference = {}
            for _ in range(80):
                key = rng.randint(-10, 10)
                op = rng.randrange(5)
                if op == 0:
                    table.put(key, op)
                    reference[key] = op
                elif op == 1:
                    self.assertEqual(table.remove(key), key in reference)
                    reference.pop(key, None)
                elif op == 2:
                    self.assertEqual(table.put_if_absent(key, 99), key not in reference)
                    reference.setdefault(key, 99)
                elif op == 3:
                    self.assertEqual(table.get_or_default(key, -1), reference.get(key, -1))
                else:
                    table.update({key: 7, key + 1: 8})
                    reference.update({key: 7, key + 1: 8})
                self.assertEqual(len(table), len(reference))
            self.assertEqual(dict(table.items()), reference)


if __name__ == '__main__':
    unittest.main()

