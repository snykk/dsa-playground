import unittest
from meet_in_middle import closest_subset_sum

class TestMeetInMiddle(unittest.TestCase):
    def test_closest_subset_sum(self):
        nums = [5, 3, 2, 7, 10]
        # Target 14: 7+5+2 = 14
        self.assertEqual(closest_subset_sum(nums, 14), 14)
        
        # Target 100: Sum of all is 27
        self.assertEqual(closest_subset_sum(nums, 100), 27)
        
        # Target 1: the smallest element is 2, so only the empty subset fits
        self.assertEqual(closest_subset_sum(nums, 1), 0)
        
        # Exact match single element
        self.assertEqual(closest_subset_sum(nums, 7), 7)

    def test_empty_input(self):
        self.assertEqual(closest_subset_sum([], 10), 0)

    def test_large_input(self):
        # 2^20 is ~1M subsets; the halves have only 2^10 sums each
        nums = list(range(1, 21))  # 1..20, total 210
        target = 200
        self.assertEqual(closest_subset_sum(nums, target), 200)

    def test_matches_brute_force(self):
        import itertools
        import random
        rng = random.Random(5)
        for _ in range(300):
            nums = [rng.randint(0, 12) for _ in range(rng.randint(0, 9))]
            target = rng.randint(0, 40)
            sums = [sum(c) for r in range(len(nums) + 1)
                    for c in itertools.combinations(nums, r)]
            expected = max(s for s in sums if s <= target)
            self.assertEqual(closest_subset_sum(nums, target), expected, (nums, target))

    def test_odd_length_and_single_element(self):
        self.assertEqual(closest_subset_sum([9], 8), 0)
        self.assertEqual(closest_subset_sum([9], 9), 9)
        self.assertEqual(closest_subset_sum([4, 4, 4], 9), 8)

    def test_zero_target(self):
        self.assertEqual(closest_subset_sum([1, 2, 3], 0), 0)

    def test_invalid_input_raises(self):
        """Negative numbers break the pruning; a negative target has no valid subset"""
        with self.assertRaises(ValueError):
            closest_subset_sum([3, -1, 2], 4)
        with self.assertRaises(ValueError):
            closest_subset_sum([1, 2, 3], -1)


if __name__ == '__main__':
    unittest.main()
