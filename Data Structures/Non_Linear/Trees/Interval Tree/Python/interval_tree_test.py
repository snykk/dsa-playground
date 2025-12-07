"""
Test cases for Interval Tree
"""

import unittest
from interval_tree import IntervalTree, Interval


class TestIntervalTree(unittest.TestCase):
    
    def setUp(self):
        self.tree = IntervalTree()
    
    def test_insert_and_search_overlapping(self):
        """Test basic insert and overlap search"""
        intervals = [
            Interval(15, 20),
            Interval(10, 30),
            Interval(17, 19),
            Interval(5, 20),
            Interval(12, 15),
            Interval(30, 40)
        ]
        
        for interval in intervals:
            self.tree.insert(interval)
        
        # Search for overlapping intervals
        query = Interval(14, 16)
        result = self.tree.search_overlapping(query)
        
        # Should find intervals that overlap with [14, 16]
        self.assertGreater(len(result), 0)
        for interval in result:
            self.assertTrue(interval.overlaps(query))
    
    def test_search_containing_point(self):
        """Test search for intervals containing a point"""
        intervals = [
            Interval(10, 20),
            Interval(15, 25),
            Interval(5, 15),
            Interval(20, 30)
        ]
        
        for interval in intervals:
            self.tree.insert(interval)
        
        # Search for point 15
        result = self.tree.search_containing_point(15)
        
        # Should find intervals containing 15
        self.assertGreater(len(result), 0)
        for interval in result:
            self.assertTrue(interval.contains_point(15))
    
    def test_search_contained_in(self):
        """Test search for intervals contained in query"""
        intervals = [
            Interval(10, 20),
            Interval(15, 18),
            Interval(12, 16),
            Interval(25, 30)
        ]
        
        for interval in intervals:
            self.tree.insert(interval)
        
        # Search for intervals contained in [10, 20]
        query = Interval(10, 20)
        result = self.tree.search_contained_in(query)
        
        # Should find intervals completely contained in [10, 20]
        for interval in result:
            self.assertLessEqual(query.low, interval.low)
            self.assertGreaterEqual(query.high, interval.high)
    
    def test_delete(self):
        """Test delete operation"""
        interval1 = Interval(10, 20)
        interval2 = Interval(15, 25)
        
        self.tree.insert(interval1)
        self.tree.insert(interval2)
        
        self.assertEqual(self.tree.size(), 2)
        
        self.tree.delete(interval1)
        self.assertEqual(self.tree.size(), 1)
        
        # Verify deleted interval is not found
        result = self.tree.search_overlapping(Interval(10, 20))
        found = any(i.low == 10 and i.high == 20 for i in result)
        self.assertFalse(found)
    
    def test_empty_tree(self):
        """Test operations on empty tree"""
        self.assertTrue(self.tree.is_empty())
        self.assertEqual(self.tree.size(), 0)
        self.assertEqual(self.tree.search_overlapping(Interval(10, 20)), [])
        self.assertEqual(self.tree.search_containing_point(15), [])
    
    def test_single_interval(self):
        """Test tree with single interval"""
        interval = Interval(10, 20)
        self.tree.insert(interval)
        
        self.assertFalse(self.tree.is_empty())
        self.assertEqual(self.tree.size(), 1)
        
        result = self.tree.search_overlapping(Interval(15, 25))
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0], interval)
    
    def test_no_overlap(self):
        """Test search when no intervals overlap"""
        intervals = [
            Interval(10, 20),
            Interval(30, 40),
            Interval(50, 60)
        ]
        
        for interval in intervals:
            self.tree.insert(interval)
        
        # Search for interval that doesn't overlap
        result = self.tree.search_overlapping(Interval(70, 80))
        self.assertEqual(len(result), 0)
    
    def test_all_overlap(self):
        """Test when all intervals overlap"""
        intervals = [
            Interval(10, 30),
            Interval(15, 25),
            Interval(20, 40)
        ]
        
        for interval in intervals:
            self.tree.insert(interval)
        
        # Search with query that overlaps all
        result = self.tree.search_overlapping(Interval(20, 25))
        self.assertEqual(len(result), 3)
    
    def test_inorder_traversal(self):
        """Test inorder traversal"""
        intervals = [
            Interval(30, 40),
            Interval(10, 20),
            Interval(50, 60)
        ]
        
        for interval in intervals:
            self.tree.insert(interval)
        
        result = self.tree.inorder_traversal()
        # Should be sorted by low value
        self.assertEqual(result[0].low, 10)
        self.assertEqual(result[1].low, 30)
        self.assertEqual(result[2].low, 50)
    
    def test_tuple_insertion(self):
        """Test insertion using tuples"""
        self.tree.insert((10, 20))
        self.tree.insert((15, 25))
        
        result = self.tree.search_overlapping((12, 18))
        self.assertGreater(len(result), 0)


if __name__ == '__main__':
    unittest.main()

