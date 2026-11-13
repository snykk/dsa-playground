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
        # Frequencies 5, 3, 2 give an optimal cost of 5 + 10 = 15 bits, out of 80
        self.assertEqual(len(encoded), 15)
        self.assertAlmostEqual(ratio, 15 / 80)
        self.assertAlmostEqual(savings, (1 - 15 / 80) * 100)

    def test_known_code_table(self):
        """Frequencies 45, 13, 12, 16, 9, 5 have no ties, so the tree is unique"""
        text = "a" * 45 + "b" * 13 + "c" * 12 + "d" * 16 + "e" * 9 + "f" * 5
        encoded, codes, tree = huffman_encode(text)
        self.assertEqual(codes, {"a": "0", "c": "100", "b": "101",
                                 "f": "1100", "e": "1101", "d": "111"})
        self.assertEqual(len(encoded), 224)
        self.assertEqual(huffman_decode(encoded, tree), text)

    def test_single_symbol_gets_code_zero(self):
        """One distinct symbol: its code is "0", one bit per character"""
        encoded, codes, tree = huffman_encode("aaaa")
        self.assertEqual(codes, {"a": "0"})
        self.assertEqual(encoded, "0000")

    def test_codes_are_prefix_free_and_optimal(self):
        """No code is a prefix of another; the length equals the sum of the
        internal node frequencies (the cost of an optimal Huffman tree)"""
        def internal_sum(node):
            if node is None or node.char is not None:
                return 0
            return node.freq + internal_sum(node.left) + internal_sum(node.right)

        for text in ("hello", "abracadabra", "mississippi", "abcdefgh" * 3,
                     "h\u00e9llo w\u00f6rld"):
            encoded, codes, tree = huffman_encode(text)
            words = list(codes.values())
            for i, a in enumerate(words):
                for j, b in enumerate(words):
                    if i != j:
                        self.assertFalse(b.startswith(a), (text, codes))
            if len(codes) > 1:
                self.assertEqual(len(encoded), internal_sum(tree), text)
            self.assertEqual(huffman_decode(encoded, tree), text)

    def test_decode_empty_inputs(self):
        self.assertEqual(huffman_decode("0101", None), "")
        _, _, tree = huffman_encode("ab")
        self.assertEqual(huffman_decode("", tree), "")


if __name__ == '__main__':
    unittest.main()

