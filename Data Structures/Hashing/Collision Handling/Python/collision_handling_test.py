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


class TestOpenAddressing(unittest.TestCase):
    
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
    
    def test_basic_operations(self):
        """Test basic operations with quadratic probing"""
        table = HashTableQuadraticProbing()
        table.put("apple", 5)
        table.put("banana", 10)
        
        self.assertEqual(table.get("apple"), 5)
        self.assertEqual(table.get("banana"), 10)


if __name__ == '__main__':
    unittest.main()

