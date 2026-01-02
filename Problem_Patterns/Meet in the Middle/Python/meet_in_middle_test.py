import unittest
from meet_in_middle import closest_subset_sum

class TestMeetInMiddle(unittest.TestCase):
    def test_closest_subset_sum(self):
        nums = [5, 3, 2, 7, 10]
        # Target 14: 7+5+2 = 14
        self.assertEqual(closest_subset_sum(nums, 14), 14)
        
        # Target 100: Sum of all is 27
        self.assertEqual(closest_subset_sum(nums, 100), 27)
        
        # Target 1: Closest is 0 (empty set) if all > 1? No 0 is always valid. 
        # Smallest element is 2. So if target 1, max sum is 0.
        self.assertEqual(closest_subset_sum(nums, 1), 0)
        
        # Exact match single element
        self.assertEqual(closest_subset_sum(nums, 7), 7)

    def test_empty_input(self):
        self.assertEqual(closest_subset_sum([], 10), 0)

    def test_large_input(self):
        # 2^20 is ~1M, manageable.
        # Let's try N=20
        nums = list(range(1, 21)) # 1..20
        # Sum 1..20 = 210
        target = 200
        self.assertEqual(closest_subset_sum(nums, target), 200)

if __name__ == '__main__':
    unittest.main()
