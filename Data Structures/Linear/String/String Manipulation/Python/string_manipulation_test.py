import unittest
from string_manipulation import *

class TestStringManipulation(unittest.TestCase):
    def test_reverse(self):
        self.assertEqual(reverse_string("hello"), "olleh")

    def test_palindrome(self):
        self.assertTrue(is_palindrome("level"))
        self.assertFalse(is_palindrome("hello"))

    def test_vowel_count(self):
        self.assertEqual(count_vowels("hello"), 2)
        self.assertEqual(count_vowels("xyz"), 0)

    def test_replace_char(self):
        self.assertEqual(replace_char("hello","l","x"),"hexxo")

    def test_case_conversion(self):
        self.assertEqual(to_upper("abc"), "ABC")
        self.assertEqual(to_lower("ABC"), "abc")

    def test_split_join(self):
        lst = split_string("a b c")
        self.assertEqual(lst, ["a","b","c"])
        self.assertEqual(join_string(lst,"-"), "a-b-c")

    def test_palindrome_edge_cases(self):
        self.assertTrue(is_palindrome(""))
        self.assertTrue(is_palindrome("a"))
        self.assertTrue(is_palindrome("abba"))
        self.assertFalse(is_palindrome("Aa"))  # case sensitive
        self.assertTrue(is_palindrome("\u00e9\u00e9"))

    def test_reverse_edge_cases(self):
        self.assertEqual(reverse_string(""), "")
        self.assertEqual(reverse_string("a"), "a")
        self.assertEqual(reverse_string("h\u00e9llo"), "oll\u00e9h")  # code points, not bytes

    def test_split_keeps_empty_fields(self):
        self.assertEqual(split_string(""), [""])
        self.assertEqual(split_string("a b "), ["a", "b", ""])
        self.assertEqual(split_string("a  b"), ["a", "", "b"])
        self.assertEqual(split_string("a,b", ","), ["a", "b"])
        # split() with no argument would collapse runs of spaces; split(" ") does not
        self.assertNotEqual(split_string("a  b"), "a  b".split())

    def test_join_edge_cases(self):
        self.assertEqual(join_string([]), "")
        self.assertEqual(join_string(["x"], "-"), "x")
        self.assertEqual(join_string(split_string("a b "), " "), "a b ")

    def test_replace_substring_semantics(self):
        # Python replaces substrings, not just one character
        self.assertEqual(replace_char("hello", "ll", "L"), "heLo")
        self.assertEqual(replace_char("", "a", "b"), "")
        # an empty `old` inserts between every character
        self.assertEqual(replace_char("abc", "", "-"), "-a-b-c-")

    def test_vowels_and_case(self):
        self.assertEqual(count_vowels(""), 0)
        self.assertEqual(count_vowels("AEIOUaeiou"), 10)
        self.assertEqual(to_upper(""), "")
        self.assertEqual(to_upper("Hello World 123"), "HELLO WORLD 123")
        self.assertEqual(to_lower("Hello World 123"), "hello world 123")

if __name__ == "__main__":
    unittest.main()
