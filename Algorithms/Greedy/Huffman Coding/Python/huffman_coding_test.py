"""
Test cases for Huffman Coding
"""

import unittest
from huffman_coding import (
    huffman_encode,
    huffman_decode,
    build_huffman_tree,
    build_codes,
    calculate_compression_ratio
)


class TestHuffmanCoding(unittest.TestCase):
    
    def test_simple_encode_decode(self):
        """Test encoding and decoding"""
        text = "hello"
        encoded, codes, tree = huffman_encode(text)
        decoded = huffman_decode(encoded, tree)
        self.assertEqual(decoded, text)
    
    def test_single_character(self):
        """Test with single character"""
        text = "aaaa"
        encoded, codes, tree = huffman_encode(text)
        decoded = huffman_decode(encoded, tree)
        self.assertEqual(decoded, text)
    
    def test_empty_string(self):
        """Test with empty string"""
        text = ""
        encoded, codes, tree = huffman_encode(text)
        self.assertEqual(encoded, "")
        self.assertEqual(codes, {})
    
    def test_repeated_characters(self):
        """Test with repeated characters"""
        text = "aaaabbbb"
        encoded, codes, tree = huffman_encode(text)
        decoded = huffman_decode(encoded, tree)
        self.assertEqual(decoded, text)
    
    def test_all_different(self):
        """Test with all different characters"""
        text = "abcdef"
        encoded, codes, tree = huffman_encode(text)
        decoded = huffman_decode(encoded, tree)
        self.assertEqual(decoded, text)
    
    def test_compression_ratio(self):
        """Test compression ratio calculation"""
        text = "aaaaabbbcc"
        encoded, codes, tree = huffman_encode(text)
        ratio, savings = calculate_compression_ratio(text, encoded, codes)
        self.assertGreaterEqual(ratio, 0)
        self.assertLessEqual(ratio, 1)


if __name__ == '__main__':
    unittest.main()

