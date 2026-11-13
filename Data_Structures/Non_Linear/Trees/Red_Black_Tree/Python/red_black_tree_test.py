import random
import unittest
from red_black_tree import RedBlackTree

class TestRedBlackTree(unittest.TestCase):
    def setUp(self):
        self.rbt = RedBlackTree()

    def test_insert_and_search(self):
        self.rbt.insert(10)
        self.rbt.insert(20)
        self.rbt.insert(30)
        self.assertTrue(self.rbt.search(10))
        self.assertTrue(self.rbt.search(20))
        self.assertTrue(self.rbt.search(30))
        self.assertFalse(self.rbt.search(40))

    def test_is_empty(self):
        self.assertTrue(self.rbt.is_empty())
        self.rbt.insert(1)
        self.assertFalse(self.rbt.is_empty())

    def test_size(self):
        self.assertEqual(self.rbt.size(), 0)
        self.rbt.insert(10)
        self.rbt.insert(20)
        self.rbt.insert(30)
        self.assertEqual(self.rbt.size(), 3)

    def test_height(self):
        self.assertEqual(self.rbt.height(), 0)
        self.rbt.insert(10)
        self.assertEqual(self.rbt.height(), 1)
        self.rbt.insert(20)
        self.rbt.insert(30)
        # Tree should be balanced
        self.assertLessEqual(self.rbt.height(), 3)

    def test_find_min(self):
        self.assertIsNone(self.rbt.find_min())
        self.rbt.insert(10)
        self.rbt.insert(5)
        self.rbt.insert(15)
        self.assertEqual(self.rbt.find_min(), 5)

    def test_find_max(self):
        self.assertIsNone(self.rbt.find_max())
        self.rbt.insert(10)
        self.rbt.insert(5)
        self.rbt.insert(15)
        self.assertEqual(self.rbt.find_max(), 15)

    def test_inorder_traversal_sorted(self):
        self.rbt.insert(50)
        self.rbt.insert(30)
        self.rbt.insert(70)
        self.rbt.insert(20)
        self.rbt.insert(40)
        result = self.rbt.inorder_traversal()
        self.assertEqual(result, [20, 30, 40, 50, 70])

    def test_complex_insertion(self):
        values = [10, 20, 30, 40, 50, 25, 35]
        for val in values:
            self.rbt.insert(val)
        # Verify all inserted
        for val in values:
            self.assertTrue(self.rbt.search(val))
        # Verify sorted order
        result = self.rbt.inorder_traversal()
        self.assertEqual(result, sorted(values))

def check_invariants(tree):
    """Return the black height; raise AssertionError if any rule is broken."""
    nil = tree.NIL
    assert tree.root.color == 1, "root must be black"

    def walk(node, lo, hi):
        if node is nil:
            return 1
        if lo is not None:
            assert node.data >= lo
        if hi is not None:
            assert node.data <= hi
        if node.color == 0:
            assert node.left.color == 1 and node.right.color == 1, "red-red"
        for child in (node.left, node.right):
            if child is not nil:
                assert child.parent is node
        lh = walk(node.left, lo, node.data)
        rh = walk(node.right, node.data, hi)
        assert lh == rh, "black heights differ"
        return lh + (1 if node.color == 1 else 0)

    return walk(tree.root, None, None)


class TestRedBlackInvariants(unittest.TestCase):
    def test_random_inserts_with_duplicates(self):
        rng = random.Random(7)
        for _ in range(40):
            t = RedBlackTree()
            n = rng.randint(1, 150)
            for _ in range(n):
                t.insert(rng.randint(0, 50))
                check_invariants(t)
            self.assertEqual(t.size(), n)
            out = t.inorder_traversal()
            self.assertEqual(out, sorted(out))

    def test_sorted_input_height_bound(self):
        t = RedBlackTree()
        for i in range(1000):
            t.insert(i)
        check_invariants(t)
        self.assertLessEqual(t.height(), 20)  # 2 * log2(1001) = 19.9

    def test_find_min_max_empty(self):
        t = RedBlackTree()
        self.assertIsNone(t.find_min())
        self.assertIsNone(t.find_max())

    def test_min_max(self):
        t = RedBlackTree()
        for v in [5, 1, 9, 3]:
            t.insert(v)
        self.assertEqual(t.find_min(), 1)
        self.assertEqual(t.find_max(), 9)


if __name__ == "__main__":
    unittest.main()

