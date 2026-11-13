"""Unit tests for Treap."""
import random
import unittest

from treap import Treap


class TestTreap(unittest.TestCase):
    def test_empty_treap(self):
        t = Treap()
        self.assertEqual(len(t), 0)
        self.assertNotIn(1, t)
        self.assertEqual(t.inorder(), [])

    def test_single_insert(self):
        t = Treap()
        self.assertTrue(t.insert(5))
        self.assertEqual(len(t), 1)
        self.assertIn(5, t)

    def test_duplicate_insert_is_noop(self):
        t = Treap()
        self.assertTrue(t.insert(5))
        self.assertFalse(t.insert(5))   # duplicate rejected
        self.assertEqual(len(t), 1)

    def test_inorder_is_sorted(self):
        t = Treap()
        keys = [5, 3, 7, 1, 9, 4, 6, 2, 8]
        for k in keys:
            t.insert(k)
        self.assertEqual(t.inorder(), sorted(keys))

    def test_delete_existing(self):
        t = Treap()
        for k in [5, 3, 7]:
            t.insert(k)
        self.assertTrue(t.delete(3))
        self.assertNotIn(3, t)
        self.assertEqual(len(t), 2)

    def test_delete_nonexistent(self):
        t = Treap()
        t.insert(5)
        self.assertFalse(t.delete(99))
        self.assertEqual(len(t), 1)

    def test_delete_root(self):
        t = Treap()
        for k in [5, 3, 7]:
            t.insert(k)
        self.assertTrue(t.delete(5))   # try deleting whatever is root
        self.assertEqual(set(t.inorder()), {3, 7})

    def test_delete_all(self):
        t = Treap()
        keys = [10, 20, 5, 15, 25, 3, 8]
        for k in keys:
            t.insert(k)
        for k in keys:
            self.assertTrue(t.delete(k))
        self.assertEqual(len(t), 0)
        self.assertEqual(t.inorder(), [])

    def test_contains(self):
        t = Treap()
        for k in [10, 20, 30]:
            t.insert(k)
        self.assertIn(10, t)
        self.assertIn(20, t)
        self.assertIn(30, t)
        self.assertNotIn(15, t)

    def test_randomized_stress(self):
        random.seed(42)
        t = Treap()
        reference = set()
        for _ in range(1000):
            k = random.randint(0, 500)
            op = random.choice(["insert", "delete"])
            if op == "insert":
                expected = k not in reference
                self.assertEqual(t.insert(k), expected)
                reference.add(k)
            else:
                expected = k in reference
                self.assertEqual(t.delete(k), expected)
                reference.discard(k)
        self.assertEqual(t.inorder(), sorted(reference))
        self.assertTrue(t.check_heap_property())

    def test_heap_property_invariant(self):
        t = Treap()
        for k in [50, 25, 75, 10, 40, 60, 90, 5, 15, 35, 55]:
            t.insert(k)
        self.assertTrue(t.check_heap_property())

    def test_delete_with_non_integer_keys(self):
        """Regression: delete used key + 1, which breaks for float keys."""
        t = Treap()
        for k in [1.0, 1.5, 2.0]:
            t.insert(k)
        self.assertTrue(t.delete(1.0))
        self.assertEqual(t.inorder(), [1.5, 2.0])
        self.assertEqual(len(t), 2)

    def test_delete_large_keys(self):
        t = Treap()
        big = 2 ** 62
        t.insert(1)
        t.insert(big)
        self.assertTrue(t.delete(big))
        self.assertEqual(t.inorder(), [1])
        self.assertNotIn(big, t)


if __name__ == "__main__":
    unittest.main()
