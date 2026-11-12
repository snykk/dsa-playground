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

    def test_tiny_filter_still_rejects(self):
        """BloomFilter(2, 0.5) used to get 0 hashes and answer True for everything"""
        bf = BloomFilter(2, error_rate=0.5)
        self.assertGreaterEqual(bf.num_hashes, 1)
        self.assertFalse(bf.contains("never"))

    def test_sizing_for_one_percent(self):
        """100 items at 1%: ceil(958.5) = 959 bits and k = round(6.65) = 7"""
        stats = BloomFilter(100, error_rate=0.01).get_stats()
        self.assertEqual(stats['num_bits'], 959)
        self.assertEqual(stats['num_hashes'], 7)

    def test_invalid_arguments(self):
        for capacity, rate in [(0, 0.01), (-5, 0.01), (10, 0.0), (10, 1.0), (10, 1.5)]:
            with self.assertRaises(ValueError):
                BloomFilter(capacity, rate)

    def test_measured_false_positive_rate(self):
        """The measured rate must be near the configured 1% (well under 3%)"""
        bf = BloomFilter(1000, error_rate=0.01)
        for i in range(1000):
            bf.add("member-%d" % i)
        for i in range(1000):
            self.assertTrue(bf.contains("member-%d" % i))
        false_positives = sum(1 for j in range(20000) if bf.contains("other-%d" % j))
        self.assertLess(false_positives / 20000.0, 0.03)


if __name__ == '__main__':
    unittest.main()

