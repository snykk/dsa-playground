"""
Test cases for Hash Table
"""

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


if __name__ == '__main__':
    unittest.main()

