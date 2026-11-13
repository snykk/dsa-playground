"""
Test cases for Bucket Sort
"""

import random
import unittest
from bucket_sort import bucket_sort, bucket_sort_integers


class TestBucketSort(unittest.TestCase):
    
    def test_basic_sort_floats(self):
        """Test basic sorting with floats"""
        arr = [0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434]
        expected = sorted(arr)
        result = bucket_sort(arr.copy())
        self.assertEqual(result, expected)
    
    def test_basic_sort_integers(self):
        """Test basic sorting with integers"""
        arr = [4, 2, 2, 8, 3, 3, 1]
        expected = sorted(arr)
        result = bucket_sort_integers(arr.copy())
        self.assertEqual(result, expected)
    
    def test_empty_array(self):
        """Test with empty array"""
        arr = []
        result = bucket_sort(arr.copy())
        self.assertEqual(result, [])
    
    def test_single_element(self):
        """Test with single element"""
        arr = [0.5]
        result = bucket_sort(arr.copy())
        self.assertEqual(result, [0.5])

    def test_one_and_zero(self):
        """1.0 goes to the last bucket; 0.0 to the first"""
        self.assertEqual(bucket_sort([0.5, 1.0, 0.25]), [0.25, 0.5, 1.0])
        self.assertEqual(bucket_sort([1.0, 0.0, 1.0, 0.0]), [0.0, 0.0, 1.0, 1.0])
        self.assertEqual(bucket_sort([0.9, 0.1, 1.0], num_buckets=2), [0.1, 0.9, 1.0])

    def test_out_of_range_values_raise(self):
        """Regression: negatives wrapped to the last buckets (wrong order)"""
        for arr in ([-0.9, 0.1, 0.5], [1.5, 0.2], [0.3, float("nan")], [float("inf")]):
            with self.assertRaises(ValueError):
                bucket_sort(list(arr))

    def test_integers_with_negatives(self):
        """Regression: bucket_sort_integers([1, -1, 0]) returned [0, 1, -1]"""
        for arr in ([1, -1, 0], [-3, -1, -2], [5, -5, 0, 5, -5], [7]):
            self.assertEqual(bucket_sort_integers(list(arr)), sorted(arr))
        with self.assertRaises(ValueError):
            bucket_sort_integers([5, 1], max_val=3)

    def test_random_against_sorted(self):
        """Random input in [0, 1] matches sorted()"""
        rng = random.Random(3)
        for _ in range(300):
            arr = [rng.choice([rng.random(), round(rng.random(), 2), 1.0])
                   for _ in range(rng.randint(0, 30))]
            self.assertEqual(bucket_sort(list(arr)), sorted(arr))
            ints = [rng.randint(-20, 20) for _ in range(rng.randint(0, 30))]
            self.assertEqual(bucket_sort_integers(list(ints)), sorted(ints))


if __name__ == '__main__':
    unittest.main()

