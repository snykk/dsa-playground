"""
Test cases for Activity Selection
"""

import unittest
from activity_selection import (
    activity_selection,
    activity_selection_with_weights,
    activity_selection_recursive
)


class TestActivitySelection(unittest.TestCase):
    
    def test_basic_selection(self):
        """Test basic activity selection"""
        activities = [(1, 4), (3, 5), (0, 6), (5, 7), (8, 9), (5, 9)]
        result = activity_selection(activities)
        # Should select activities that finish earliest
        self.assertGreaterEqual(len(result), 3)
    
    def test_no_overlap(self):
        """Test with no overlapping activities"""
        activities = [(1, 2), (3, 4), (5, 6), (7, 8)]
        result = activity_selection(activities)
        self.assertEqual(len(result), 4)
    
    def test_all_overlap(self):
        """Test with all activities overlapping"""
        activities = [(1, 5), (2, 6), (3, 7), (4, 8)]
        result = activity_selection(activities)
        # Should select only one (the one that finishes first)
        self.assertEqual(len(result), 1)
    
    def test_empty_list(self):
        """Test with empty list"""
        activities = []
        result = activity_selection(activities)
        self.assertEqual(result, [])
    
    def test_single_activity(self):
        """Test with single activity"""
        activities = [(1, 4)]
        result = activity_selection(activities)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0], 0)
    
    def test_sorted_by_start(self):
        """Test activities already sorted by start time"""
        activities = [(1, 4), (3, 5), (5, 7), (8, 9)]
        result = activity_selection(activities)
        # Should select all 4 as they don't overlap
        self.assertGreaterEqual(len(result), 3)
    
    def test_activity_selection_with_weights(self):
        """Test activity selection with weights"""
        activities = [(1, 4, 10), (3, 5, 5), (0, 6, 15), (5, 7, 7)]
        result = activity_selection_with_weights(activities)
        # Should return maximum weight
        self.assertGreater(result, 0)
    
    def test_recursive_selection(self):
        """Test recursive implementation"""
        activities = [(1, 4), (3, 5), (0, 6), (5, 7), (8, 9)]
        result = activity_selection_recursive(activities)
        self.assertGreaterEqual(len(result), 3)


if __name__ == '__main__':
    unittest.main()

