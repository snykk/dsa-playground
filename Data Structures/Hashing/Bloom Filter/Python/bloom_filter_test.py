"""
Test cases for Bloom Filter
"""

import unittest
from bloom_filter import BloomFilter


class TestBloomFilter(unittest.TestCase):
    
    def setUp(self):
        self.bf = BloomFilter(100, error_rate=0.01)
    
    def test_add_and_contains(self):
        """Test add and contains operations"""
        self.bf.add("apple")
        self.bf.add("banana")
        self.bf.add("cherry")
        
        self.assertTrue(self.bf.contains("apple"))
        self.assertTrue(self.bf.contains("banana"))
        self.assertTrue(self.bf.contains("cherry"))
        self.assertFalse(self.bf.contains("nonexistent"))
    
    def test_in_operator(self):
        """Test 'in' operator"""
        self.bf.add("apple")
        self.assertTrue("apple" in self.bf)
        self.assertFalse("banana" in self.bf)
    
    def test_no_false_negatives(self):
        """Test that false negatives don't occur"""
        items = ["apple", "banana", "cherry", "date", "elderberry"]
        for item in items:
            self.bf.add(item)
        
        # All added items should be found
        for item in items:
            self.assertTrue(self.bf.contains(item))
    
    def test_stats(self):
        """Test statistics"""
        self.bf.add("apple")
        stats = self.bf.get_stats()
        
        self.assertIn('capacity', stats)
        self.assertIn('num_bits', stats)
        self.assertIn('num_hashes', stats)
        self.assertGreater(stats['set_bits'], 0)


if __name__ == '__main__':
    unittest.main()

