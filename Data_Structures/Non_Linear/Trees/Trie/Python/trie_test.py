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

    def test_delete_return_value(self):
        self.trie.insert("apple")
        self.trie.insert("app")
        self.trie.insert("dog")
        self.assertTrue(self.trie.delete("apple"))
        self.assertFalse(self.trie.search("apple"))
        self.assertTrue(self.trie.search("app"))
        self.assertFalse(self.trie.delete("apple"))   # already gone
        self.assertFalse(self.trie.delete("appl"))    # a prefix, not a word
        self.assertFalse(self.trie.delete("cat"))     # never inserted
        self.assertTrue(self.trie.delete("app"))
        self.assertTrue(self.trie.delete("dog"))
        self.assertTrue(self.trie.is_empty())

    def test_delete_prunes_unused_nodes(self):
        self.trie.insert("apple")
        self.trie.insert("app")
        self.trie.delete("apple")
        node = self.trie.root
        for char in "app":
            node = node.children[char]
        self.assertEqual(node.children, {})
        self.assertTrue(node.is_end_of_word)

    def test_empty_word(self):
        self.trie.insert("")
        self.assertEqual(self.trie.count_words(), 1)
        self.assertFalse(self.trie.is_empty())
        self.assertTrue(self.trie.search(""))
        self.assertTrue(self.trie.delete(""))
        self.assertTrue(self.trie.is_empty())

    def test_long_word_does_not_recurse(self):
        word = "a" * 1200
        self.trie.insert(word)
        self.assertEqual(self.trie.get_all_words(), [word])
        self.assertEqual(self.trie.count_words(), 1)
        self.assertTrue(self.trie.delete(word))
        self.assertTrue(self.trie.is_empty())

    def test_non_ascii(self):
        self.trie.insert("caf\u00e9")
        self.trie.insert("x")
        self.assertTrue(self.trie.delete("caf\u00e9"))
        self.assertFalse(self.trie.search("caf\u00e9"))
        self.assertTrue(self.trie.search("x"))

if __name__ == "__main__":
    unittest.main()

