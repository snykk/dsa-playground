"""
Test cases for Interval Tree
"""

import random
import time
import unittest
from interval_tree import IntervalTree, Interval


def check_max(node):
    """Every node.max equals the largest high in its subtree; returns it."""
    if node is None:
        return float("-inf")
    best = max(node.interval.high, check_max(node.left), check_max(node.right))
    assert node.max == best
    return best


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


    def test_exact_results_for_overlap_query(self):
        for iv in [(15, 20), (10, 30), (17, 19), (5, 20), (12, 15), (30, 40)]:
            self.tree.insert(iv)
        result = self.tree.search_overlapping((14, 16))
        self.assertEqual(
            sorted((i.low, i.high) for i in result),
            [(5, 20), (10, 30), (12, 15), (15, 20)],
        )

    def test_touching_endpoints_overlap(self):
        self.tree.insert((1, 5))
        self.assertEqual(len(self.tree.search_overlapping((5, 9))), 1)
        self.assertEqual(len(self.tree.search_overlapping((6, 9))), 0)

    def test_duplicate_intervals_delete_one_at_a_time(self):
        for _ in range(3):
            self.tree.insert((4, 8))
        self.tree.delete((4, 8))
        self.assertEqual(self.tree.size(), 2)

    def test_insert_does_not_rescan_whole_tree(self):
        # Regression: every insert used to recompute max over the whole tree,
        # so n inserts cost O(n^2) (2000 inserts took ~1 s, 10000 took ~30 s).
        rng = random.Random(1)
        start = time.time()
        for _ in range(10000):
            low = rng.randrange(0, 1000000)
            self.tree.insert((low, low + rng.randrange(0, 1000)))
        self.assertLess(time.time() - start, 10.0)
        check_max(self.tree.root)

    def test_random_against_brute_force(self):
        for seed in range(100):
            rng = random.Random(seed)
            tree = IntervalTree()
            ref = []
            for _ in range(80):
                low = rng.randrange(0, 40)
                iv = (low, low + rng.randrange(0, 15))
                if ref and rng.random() < 0.3:
                    victim = rng.choice(ref)
                    tree.delete(victim)
                    ref.remove(victim)
                else:
                    tree.insert(iv)
                    ref.append(iv)
                check_max(tree.root)
                lo = rng.randrange(0, 50)
                q = (lo, lo + rng.randrange(0, 15))
                got = sorted((i.low, i.high) for i in tree.search_overlapping(q))
                want = sorted(iv for iv in ref if not (iv[1] < q[0] or q[1] < iv[0]))
                self.assertEqual(got, want)
                got = sorted((i.low, i.high) for i in tree.search_contained_in(q))
                want = sorted(iv for iv in ref if q[0] <= iv[0] and iv[1] <= q[1])
                self.assertEqual(got, want)
            self.assertEqual(tree.size(), len(ref))


if __name__ == '__main__':
    unittest.main()

