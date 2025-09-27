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

if __name__ == "__main__":
    unittest.main()
