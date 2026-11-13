import unittest
from main import *

class TestStringIntro(unittest.TestCase):
    def test_access_char(self):
        self.assertEqual(access_char("hello",1), "e")

    def test_length(self):
        self.assertEqual(string_length("hello"),5)

    def test_traverse(self):
        self.assertEqual(traverse_string("abc"), ["a","b","c"])

    def test_concatenate(self):
        self.assertEqual(concatenate("abc","def"), "abcdef")

    def test_substring(self):
        self.assertEqual(substring("abcdef",1,4), "bcd")

    def test_substring_clamps_and_empty_ranges(self):
        self.assertEqual(substring("abcdef", 3, 1), "")
        self.assertEqual(substring("abc", 0, 9), "abc")
        self.assertEqual(substring("abcdef", 9, 12), "")
        self.assertEqual(substring("abcdef", -3, 6), "def")  # negative index counts from the end

    def test_empty_string(self):
        self.assertEqual(string_length(""), 0)
        self.assertEqual(traverse_string(""), [])
        self.assertEqual(substring("", 0, 0), "")
        with self.assertRaises(IndexError):
            access_char("", 0)

    def test_unicode_counts_code_points(self):
        s = "h\u00e9llo"
        self.assertEqual(string_length(s), 5)
        self.assertEqual(len(s.encode("utf-8")), 6)
        self.assertEqual(access_char(s, 1), "\u00e9")
        self.assertEqual(substring(s, 0, string_length(s)), s)

if __name__ == "__main__":
    unittest.main()
