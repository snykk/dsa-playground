import unittest
from rope import Rope


class TestRope(unittest.TestCase):

    def test_create_from_string(self):
        r = Rope("Hello, World!")
        self.assertEqual(r.to_string(), "Hello, World!")
        self.assertEqual(len(r), 13)

    def test_empty_rope(self):
        r = Rope()
        self.assertEqual(r.to_string(), "")
        self.assertEqual(len(r), 0)

    def test_single_char(self):
        r = Rope("A")
        self.assertEqual(r.to_string(), "A")
        self.assertEqual(len(r), 1)
        self.assertEqual(r.index(0), "A")

    def test_index_access(self):
        r = Rope("Hello, World!")
        self.assertEqual(r.index(0), "H")
        self.assertEqual(r.index(4), "o")
        self.assertEqual(r.index(7), "W")
        self.assertEqual(r.index(12), "!")

    def test_index_out_of_bounds(self):
        r = Rope("abc")
        with self.assertRaises(IndexError):
            r.index(3)
        with self.assertRaises(IndexError):
            r.index(-1)

    def test_index_empty_rope(self):
        r = Rope()
        with self.assertRaises((IndexError, TypeError)):
            r.index(0)

    def test_concat(self):
        r1 = Rope("Hello, ")
        r2 = Rope("World!")
        r3 = r1.concat(r2)
        self.assertEqual(r3.to_string(), "Hello, World!")
        self.assertEqual(len(r3), 13)

    def test_concat_with_empty(self):
        r1 = Rope("Hello")
        r2 = Rope()
        self.assertEqual(r1.concat(r2).to_string(), "Hello")
        self.assertEqual(r2.concat(r1).to_string(), "Hello")

    def test_split(self):
        r = Rope("Hello, World!")
        left, right = r.split(7)
        self.assertEqual(left.to_string(), "Hello, ")
        self.assertEqual(right.to_string(), "World!")

    def test_split_at_start(self):
        r = Rope("Hello")
        left, right = r.split(0)
        self.assertEqual(left.to_string(), "")
        self.assertEqual(right.to_string(), "Hello")

    def test_split_at_end(self):
        r = Rope("Hello")
        left, right = r.split(5)
        self.assertEqual(left.to_string(), "Hello")
        self.assertEqual(right.to_string(), "")

    def test_insert_in_middle(self):
        r = Rope("Hello World!")
        r.insert(5, ",")
        self.assertEqual(r.to_string(), "Hello, World!")

    def test_insert_at_start(self):
        r = Rope("World!")
        r.insert(0, "Hello, ")
        self.assertEqual(r.to_string(), "Hello, World!")

    def test_insert_at_end(self):
        r = Rope("Hello, ")
        r.insert(7, "World!")
        self.assertEqual(r.to_string(), "Hello, World!")

    def test_delete_substring(self):
        r = Rope("Hello, World!")
        r.delete(5, 2)
        self.assertEqual(r.to_string(), "HelloWorld!")

    def test_delete_from_start(self):
        r = Rope("Hello, World!")
        r.delete(0, 7)
        self.assertEqual(r.to_string(), "World!")

    def test_delete_to_end(self):
        r = Rope("Hello, World!")
        r.delete(5, 8)
        self.assertEqual(r.to_string(), "Hello")

    def test_long_string(self):
        text = "abcdefghij" * 100
        r = Rope(text)
        self.assertEqual(len(r), 1000)
        self.assertEqual(r.to_string(), text)
        self.assertEqual(r.index(0), "a")
        self.assertEqual(r.index(999), "j")

    def test_multiple_operations(self):
        r = Rope("Hello")
        r.insert(5, " World")
        r.insert(11, "!")
        self.assertEqual(r.to_string(), "Hello World!")
        r.delete(5, 6)
        self.assertEqual(r.to_string(), "Hello!")


if __name__ == "__main__":
    unittest.main()
