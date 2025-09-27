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

if __name__ == "__main__":
    unittest.main()
