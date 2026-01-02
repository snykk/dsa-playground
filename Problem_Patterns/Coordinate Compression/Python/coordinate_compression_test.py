"""
Unit tests for Coordinate Compression Pattern.
"""

import unittest
from coordinate_compression import compress_coordinates, decompress_coordinates


class TestCoordinateCompression(unittest.TestCase):
    def test_compress(self):
        coords = [1000, 5, 200, 1000, 5, 50]
        mapping = compress_coordinates(coords)
        self.assertEqual(len(mapping), 4)  # Unique values
    
    def test_decompress(self):
        coords = [1000, 5, 200, 50]
        mapping = compress_coordinates(coords)
        decompressed = decompress_coordinates(mapping)
        self.assertEqual(sorted(decompressed), sorted(coords))


if __name__ == "__main__":
    unittest.main()

