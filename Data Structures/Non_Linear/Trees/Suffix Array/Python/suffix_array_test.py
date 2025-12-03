import unittest
from suffix_array import SuffixArray

class TestSuffixArray(unittest.TestCase):
    def setUp(self):
        self.text = "banana"
        self.sa = SuffixArray(self.text)

    def test_search(self):
        result = self.sa.search("ana")
        # "ana" appears at indices 1 and 3 in "banana"
        self.assertIn(1, result)
        self.assertIn(3, result)
        
        result = self.sa.search("ban")
        self.assertIn(0, result)
        
        result = self.sa.search("xyz")
        self.assertEqual(len(result), 0)

    def test_get_suffixes(self):
        suffixes = self.sa.get_suffixes()
        # Should be sorted: "a", "ana", "anana", "banana", "na", "nana"
        self.assertEqual(suffixes[0], "a")
        self.assertEqual(suffixes[-1], "nana")  # Last after sorting
        # Check sorted order
        for i in range(len(suffixes) - 1):
            self.assertLessEqual(suffixes[i], suffixes[i + 1])

    def test_longest_common_prefix(self):
        # In "banana", suffixes at index 0 and 3
        lcp = self.sa.longest_common_prefix(0, 3)
        # "banana" and "ana" have no common prefix
        self.assertEqual(lcp, 0)
        
        # Test with same suffix
        lcp = self.sa.longest_common_prefix(1, 1)
        self.assertGreater(lcp, 0)

if __name__ == "__main__":
    unittest.main()

