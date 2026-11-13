import random
import unittest
from suffix_tree import SuffixTree


def brute_force(text, pattern):
    """All start indices of pattern in text, overlapping matches included."""
    return [i for i in range(len(text) - len(pattern) + 1) if text.startswith(pattern, i)]


class TestSuffixTree(unittest.TestCase):
    def setUp(self):
        self.text = "banana"
        self.st = SuffixTree(self.text)

    def test_search(self):
        self.assertEqual(self.st.search("ana"), [1, 3])
        self.assertEqual(self.st.search("ban"), [0])
        self.assertEqual(self.st.search("a"), [1, 3, 5])
        self.assertEqual(self.st.search("na"), [2, 4])
        self.assertEqual(self.st.search("banana"), [0])
        self.assertEqual(self.st.search("xyz"), [])
        self.assertEqual(self.st.search("bananas"), [])

    def test_get_all_suffixes(self):
        self.assertEqual(
            self.st.get_all_suffixes(),
            sorted(["banana", "anana", "nana", "ana", "na", "a"]),
        )

    def test_empty_pattern_and_empty_text(self):
        self.assertEqual(self.st.search(""), [])
        empty = SuffixTree("")
        self.assertEqual(empty.search("a"), [])
        self.assertEqual(empty.get_all_suffixes(), [])

    def test_dollar_inside_text(self):
        """A '$' in the text is an ordinary character."""
        st = SuffixTree("a$a")
        self.assertEqual(st.search("a"), [0, 2])
        self.assertEqual(st.search("$a"), [1])
        st = SuffixTree("x$y$x$y")
        self.assertEqual(st.search("x"), [0, 4])
        self.assertEqual(st.search("$"), [1, 3, 5])
        self.assertEqual(SuffixTree("banana$").search("$"), [6])

    def test_nul_character_rejected(self):
        with self.assertRaises(ValueError):
            SuffixTree("a\0b")
        self.assertEqual(self.st.search("a\0"), [])

    def test_repeated_characters_and_deep_tree(self):
        st = SuffixTree("a" * 1500)
        self.assertEqual(len(st.search("a")), 1500)
        self.assertEqual(st.search("a" * 1500), [0])
        self.assertEqual(len(st.get_all_suffixes()), 1500)

    def test_random_against_brute_force(self):
        rng = random.Random(7)
        for _ in range(200):
            text = "".join(rng.choice("abc$") for _ in range(rng.randint(0, 30)))
            st = SuffixTree(text)
            for _ in range(20):
                pattern = "".join(rng.choice("abc$") for _ in range(rng.randint(1, 5)))
                self.assertEqual(st.search(pattern), brute_force(text, pattern), (text, pattern))


if __name__ == "__main__":
    unittest.main()
