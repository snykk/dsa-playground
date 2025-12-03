import unittest
from trie import Trie

class TestTrie(unittest.TestCase):
    def setUp(self):
        self.trie = Trie()

    def test_insert_and_search(self):
        self.trie.insert("apple")
        self.trie.insert("app")
        self.trie.insert("application")
        self.assertTrue(self.trie.search("apple"))
        self.assertTrue(self.trie.search("app"))
        self.assertTrue(self.trie.search("application"))
        self.assertFalse(self.trie.search("appl"))

    def test_starts_with(self):
        self.trie.insert("apple")
        self.trie.insert("app")
        self.trie.insert("application")
        self.assertTrue(self.trie.starts_with("app"))
        self.assertTrue(self.trie.starts_with("appl"))
        self.assertFalse(self.trie.starts_with("ban"))

    def test_delete(self):
        self.trie.insert("apple")
        self.trie.insert("app")
        self.assertTrue(self.trie.search("apple"))
        self.trie.delete("apple")
        self.assertFalse(self.trie.search("apple"))
        self.assertTrue(self.trie.search("app"))  # "app" should still exist

    def test_get_all_words(self):
        words = ["apple", "app", "application", "banana", "band"]
        for word in words:
            self.trie.insert(word)
        result = self.trie.get_all_words()
        self.assertEqual(sorted(result), sorted(words))

    def test_count_words(self):
        self.assertEqual(self.trie.count_words(), 0)
        self.trie.insert("apple")
        self.trie.insert("app")
        self.trie.insert("application")
        self.assertEqual(self.trie.count_words(), 3)

    def test_is_empty(self):
        self.assertTrue(self.trie.is_empty())
        self.trie.insert("test")
        self.assertFalse(self.trie.is_empty())

    def test_prefix_search(self):
        self.trie.insert("cat")
        self.trie.insert("car")
        self.trie.insert("card")
        self.assertTrue(self.trie.starts_with("ca"))
        self.assertTrue(self.trie.starts_with("car"))
        self.assertFalse(self.trie.starts_with("cab"))

if __name__ == "__main__":
    unittest.main()

