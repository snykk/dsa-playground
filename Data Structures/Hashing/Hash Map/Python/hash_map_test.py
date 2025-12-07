"""
Test cases for Hash Map
"""

import unittest
from hash_map import HashMap


class TestHashMap(unittest.TestCase):
    
    def setUp(self):
        self.map = HashMap()
    
    def test_inheritance(self):
        """Test that HashMap inherits HashTable functionality"""
        self.map.put("apple", 5)
        self.assertEqual(self.map.get("apple"), 5)
        self.assertTrue(self.map.contains("apple"))
    
    def test_iteration(self):
        """Test iteration support"""
        self.map.put("apple", 5)
        self.map.put("banana", 10)
        
        items = list(self.map)
        self.assertEqual(len(items), 2)
        self.assertIn(("apple", 5), items)
        self.assertIn(("banana", 10), items)
    
    def test_repr(self):
        """Test string representation"""
        self.map.put("apple", 5)
        self.map.put("banana", 10)
        
        repr_str = repr(self.map)
        self.assertIn("apple", repr_str)
        self.assertIn("banana", repr_str)
    
    def test_get_or_default(self):
        """Test get_or_default method"""
        self.map.put("apple", 5)
        
        self.assertEqual(self.map.get_or_default("apple", 0), 5)
        self.assertEqual(self.map.get_or_default("nonexistent", 0), 0)
    
    def test_put_if_absent(self):
        """Test put_if_absent method"""
        self.assertTrue(self.map.put_if_absent("apple", 5))
        self.assertEqual(self.map.get("apple"), 5)
        
        self.assertFalse(self.map.put_if_absent("apple", 10))
        self.assertEqual(self.map.get("apple"), 5)  # Should not change
    
    def test_update(self):
        """Test update method"""
        self.map.put("apple", 5)
        
        # Update with dictionary
        self.map.update({"banana": 10, "cherry": 15})
        self.assertEqual(self.map.get("banana"), 10)
        self.assertEqual(self.map.get("cherry"), 15)
        
        # Update with another HashMap
        other = HashMap()
        other.put("date", 20)
        self.map.update(other)
        self.assertEqual(self.map.get("date"), 20)
    
    def test_copy(self):
        """Test copy method"""
        self.map.put("apple", 5)
        self.map.put("banana", 10)
        
        copied = self.map.copy()
        self.assertEqual(copied.get("apple"), 5)
        self.assertEqual(copied.get("banana"), 10)
        
        # Modify original, copy should be unaffected
        self.map.put("apple", 20)
        self.assertEqual(copied.get("apple"), 5)


if __name__ == '__main__':
    unittest.main()

