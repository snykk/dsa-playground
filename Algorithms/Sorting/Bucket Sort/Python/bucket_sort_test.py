"""
Test cases for Bucket Sort
"""

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


if __name__ == '__main__':
    unittest.main()

