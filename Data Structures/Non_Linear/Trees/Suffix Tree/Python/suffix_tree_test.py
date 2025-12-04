import unittest
from suffix_tree import SuffixTree

class TestSuffixTree(unittest.TestCase):
    def setUp(self):
        self.text = "banana"
        self.st = SuffixTree(self.text)

    def test_search(self):
        result = self.st.search("ana")
        # "ana" appears at indices 1 and 3 in "banana"
        self.assertGreaterEqual(len(result), 1)
        # Check that found indices are valid
        for idx in result:
            self.assertIn(idx, [1, 3])
        
        result = self.st.search("ban")
        self.assertIn(0, result)
        
        result = self.st.search("xyz")
        self.assertEqual(len(result), 0)

    def test_get_all_suffixes(self):
        suffixes = self.st.get_all_suffixes()
        # Should contain all suffixes (including terminator)
        self.assertGreater(len(suffixes), 0)
        # Check that "banana" suffix exists
        has_banana = any("banana" in s for s in suffixes)
        self.assertTrue(has_banana)

    def test_pattern_matching(self):
        # Test various patterns
        self.assertGreater(len(self.st.search("a")), 0)
        self.assertGreater(len(self.st.search("na")), 0)
        self.assertEqual(len(self.st.search("xyz")), 0)

if __name__ == "__main__":
    unittest.main()


