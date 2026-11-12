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

    def test_chain_longer_than_one(self):
        """Ints that are multiples of the capacity share bucket 0"""
        s = HashSet(16)
        for k in (0, 16, 32, 48):
            self.assertTrue(s.add(k))
        self.assertEqual(len(s.buckets[0]), 4)
        self.assertFalse(s.add(32))
        self.assertTrue(s.remove(16))
        self.assertFalse(s.contains(16))
        self.assertTrue(s.contains(48))
        self.assertEqual(len(s), 3)

    def test_resize_keeps_elements(self):
        s = HashSet(4)
        for k in range(100):
            s.add(k)
        self.assertGreater(s.capacity, 4)
        self.assertEqual(sorted(s), list(range(100)))
        self.assertLessEqual(s.size / s.capacity, 0.75)

    def test_invalid_capacity(self):
        for capacity in (0, -2):
            with self.assertRaises(ValueError):
                HashSet(capacity)


if __name__ == '__main__':
    unittest.main()

