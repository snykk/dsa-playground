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
        # Finish times 4, 5, 6, 7, 9, 9: picks (1,4), (5,7), then the first of the
        # two activities that finish at 9 (the sort is stable)
        self.assertEqual(result, [0, 3, 4])
    
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
        # (3,5) overlaps (1,4), so the optimum is 3 activities, not 4
        self.assertEqual(result, [0, 2, 3])
    
    def test_activity_selection_with_weights(self):
        """Test activity selection with weights"""
        activities = [(1, 4, 10), (3, 5, 5), (0, 6, 15), (5, 7, 7)]
        result = activity_selection_with_weights(activities)
        # (1,4,10) + (5,7,7) = 17 beats (0,6,15) alone and (3,5,5) + (5,7,7)
        self.assertEqual(result, 17)
    
    def test_recursive_selection(self):
        """Test recursive implementation"""
        activities = [(1, 4), (3, 5), (0, 6), (5, 7), (8, 9)]
        result = activity_selection_recursive(activities)
        self.assertEqual(result, [0, 3, 4])

    def test_touching_activities_are_compatible(self):
        """An activity may start exactly when the previous one finishes."""
        self.assertEqual(activity_selection([(1, 2), (2, 3), (3, 4)]), [0, 1, 2])

    def test_result_is_optimal_and_non_overlapping(self):
        """Compare with brute force over all subsets on random small inputs."""
        import random
        rng = random.Random(7)
        for _ in range(200):
            n = rng.randint(1, 8)
            activities = []
            for _ in range(n):
                s = rng.randint(-5, 10)
                activities.append((s, s + rng.randint(0, 5)))
            best = 0
            for mask in range(1 << n):
                chosen = sorted((activities[i] for i in range(n) if mask >> i & 1),
                                key=lambda a: a[1])
                if all(chosen[k][0] >= chosen[k - 1][1] for k in range(1, len(chosen))):
                    best = max(best, len(chosen))
            for result in (activity_selection(activities),
                           activity_selection_recursive(activities)):
                self.assertEqual(len(result), best, activities)
                picked = sorted((activities[i] for i in result), key=lambda a: a[1])
                for k in range(1, len(picked)):
                    self.assertGreaterEqual(picked[k][0], picked[k - 1][1])

    def test_recursive_negative_start_times(self):
        """Regression: the recursive version used -1 as "nothing selected yet",
        so activities starting before -1 were skipped."""
        self.assertEqual(activity_selection_recursive([(-4, -2)]), [0])
        activities = [(-5, -3), (-4, -1), (-3, 0), (-1, 2), (2, 5)]
        self.assertEqual(activity_selection_recursive(activities), [0, 2, 4])
        self.assertEqual(activity_selection_recursive(activities),
                         activity_selection(activities))


if __name__ == '__main__':
    unittest.main()

