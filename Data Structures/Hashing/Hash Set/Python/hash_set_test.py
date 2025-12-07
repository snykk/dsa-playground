"""
Test cases for Hash Set
"""

import unittest
from hash_set import HashSet


class TestHashSet(unittest.TestCase):
    
    def setUp(self):
        self.set = HashSet()
    
    def test_add(self):
        """Test add operation"""
        self.assertTrue(self.set.add("apple"))
        self.assertTrue(self.set.add("banana"))
        self.assertFalse(self.set.add("apple"))  # Duplicate
        self.assertEqual(len(self.set), 2)
    
    def test_remove(self):
        """Test remove operation"""
        self.set.add("apple")
        self.set.add("banana")
        
        self.assertTrue(self.set.remove("apple"))
        self.assertFalse(self.set.contains("apple"))
        self.assertEqual(len(self.set), 1)
    
    def test_contains(self):
        """Test contains operation"""
        self.set.add("apple")
        self.assertTrue(self.set.contains("apple"))
        self.assertTrue("apple" in self.set)
        self.assertFalse("banana" in self.set)
    
    def test_iteration(self):
        """Test iteration"""
        self.set.add("apple")
        self.set.add("banana")
        
        items = list(self.set)
        self.assertEqual(len(items), 2)
        self.assertIn("apple", items)
        self.assertIn("banana", items)
    
    def test_clear(self):
        """Test clear operation"""
        self.set.add("apple")
        self.set.add("banana")
        
        self.set.clear()
        self.assertTrue(self.set.is_empty())
        self.assertEqual(len(self.set), 0)


if __name__ == '__main__':
    unittest.main()

