"""
Unit tests for Coordinate Compression Pattern.
"""

import unittest
from coordinate_compression import (compress_2d_coordinates, compress_coordinates,
                                    decompress_coordinates)


class TestCoordinateCompression(unittest.TestCase):
    def test_compress(self):
        coords = [1000, 5, 200, 1000, 5, 50]
        mapping = compress_coordinates(coords)
        self.assertEqual(len(mapping), 4)  # Unique values
        # Ranks follow the sorted order of the distinct values
        self.assertEqual(mapping, {5: 0, 50: 1, 200: 2, 1000: 3})

    def test_ranks_preserve_order(self):
        coords = [1000, 5, 200, 1000, 5, 50]
        mapping = compress_coordinates(coords)
        self.assertEqual([mapping[c] for c in coords], [3, 0, 2, 3, 0, 1])

    def test_negative_and_empty(self):
        self.assertEqual(compress_coordinates([]), {})
        self.assertEqual(compress_coordinates([7, -3, 0, -3]), {-3: 0, 0: 1, 7: 2})
        self.assertEqual(compress_coordinates([42]), {42: 0})
    
    def test_decompress(self):
        coords = [1000, 5, 200, 50]
        mapping = compress_coordinates(coords)
        decompressed = decompress_coordinates(mapping)
        self.assertEqual(sorted(decompressed), sorted(coords))
        self.assertEqual(decompressed, [5, 50, 200, 1000])  # index = rank

    def test_decompress_empty(self):
        self.assertEqual(decompress_coordinates({}), [])

    def test_compress_2d(self):
        points = [(1000, 500), (5, 10), (200, 300), (5, 500)]
        x_map, y_map = compress_2d_coordinates(points)
        self.assertEqual(x_map, {5: 0, 200: 1, 1000: 2})
        self.assertEqual(y_map, {10: 0, 300: 1, 500: 2})


if __name__ == "__main__":
    unittest.main()

