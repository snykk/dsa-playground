import math
import random
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

    def _check_tree(self, node):
        """Cached fields are right and sibling heights differ by at most 1."""
        if node is None:
            return
        if node.data is not None:
            self.assertTrue(node.data)
            self.assertEqual((node.length, node.height), (len(node.data), 0))
            return
        self._check_tree(node.left)
        self._check_tree(node.right)
        self.assertEqual(node.weight, node.left.length)
        self.assertEqual(node.length, node.left.length + node.right.length)
        self.assertEqual(node.height, 1 + max(node.left.height, node.right.height))
        self.assertLessEqual(abs(node.left.height - node.right.height), 1)

    def test_height_stays_logarithmic_for_appends(self):
        # Used to degenerate: height 2001 after 2000 appends and RecursionError after ~1000
        r = Rope()
        for i in range(5000):
            r.insert(len(r), "x")
        self.assertEqual(len(r), 5000)
        self.assertLessEqual(r.height(), 2 * math.log2(5000))
        self.assertEqual(r.to_string(), "x" * 5000)
        self.assertEqual(r.index(0), "x")
        r.insert(0, "y")
        self.assertEqual(r.index(0), "y")
        self._check_tree(r._root)

    def test_height_stays_logarithmic_for_prepends(self):
        r = Rope()
        for i in range(3000):
            r.insert(0, str(i % 10))
        self.assertLessEqual(r.height(), 2 * math.log2(3000))
        self._check_tree(r._root)

    def test_random_edits_match_plain_string(self):
        rng = random.Random(7)
        r = Rope("seed text")
        model = "seed text"
        for _ in range(3000):
            op = rng.choice(["insert", "delete", "split", "concat"])
            pos = rng.randint(-3, len(model) + 3)
            if op == "insert":
                text = "".join(rng.choice("abc") for _ in range(rng.randint(0, 12)))
                r.insert(pos, text)
                p = min(max(pos, 0), len(model))
                model = model[:p] + text + model[p:]
            elif op == "delete":
                n = rng.randint(0, 15)
                r.delete(pos, n)
                p = min(max(pos, 0), len(model))
                model = model[:p] + model[p + max(n, 0):]
            elif op == "split":
                left, right = r.split(pos)
                p = min(max(pos, 0), len(model))
                self.assertEqual(left.to_string(), model[:p])
                self.assertEqual(right.to_string(), model[p:])
                r = left.concat(right)
            else:
                other = Rope("-" * rng.randint(0, 20))
                r = r.concat(other)
                model += other.to_string()
            self.assertEqual(len(r), len(model))
        self.assertEqual(r.to_string(), model)
        self._check_tree(r._root)
        for i in range(0, len(model), 7):
            self.assertEqual(r.index(i), model[i])

    def test_split_and_concat_leave_sources_unchanged(self):
        r = Rope("abcdefghijklmnopqrstuvwxyz" * 3)
        before = r.to_string()
        left, right = r.split(30)
        left.concat(right)
        self.assertEqual(r.to_string(), before)
        self.assertEqual(left.to_string(), before[:30])
        self.assertEqual(right.to_string(), before[30:])


if __name__ == "__main__":
    unittest.main()
