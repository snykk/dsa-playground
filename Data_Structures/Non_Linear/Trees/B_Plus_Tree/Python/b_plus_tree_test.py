import unittest
import random
from b_plus_tree import BPlusTree


def check_invariants(tree):
    """Fill bounds, separator order, equal leaf depth and the leaf chain."""
    leaves = []

    def walk(node, is_root, lo, hi):
        n = len(node.keys)
        assert n <= tree.max_keys
        if not is_root:
            assert n >= tree.min_keys
        elif not node.is_leaf:
            assert n >= 1
        assert all(node.keys[i] < node.keys[i + 1] for i in range(n - 1))
        for k in node.keys:
            assert (lo is None or k >= lo) and (hi is None or k < hi)
        if node.is_leaf:
            assert len(node.values) == n and not node.children
            leaves.append(node)
            return 0
        assert len(node.children) == n + 1
        depths = set()
        for i, child in enumerate(node.children):
            c_lo = lo if i == 0 else node.keys[i - 1]
            c_hi = hi if i == n else node.keys[i]
            depths.add(walk(child, False, c_lo, c_hi))
        assert len(depths) == 1
        return depths.pop() + 1

    walk(tree.root, True, None, None)
    for a, b in zip(leaves, leaves[1:]):
        assert a.next is b
    assert leaves[-1].next is None

class TestBPlusTree(unittest.TestCase):
    def setUp(self):
        self.bptree = BPlusTree(min_degree=3)

    def test_insert_and_search(self):
        self.bptree.insert(10, "value10")
        self.bptree.insert(20, "value20")
        self.bptree.insert(5, "value5")
        
        self.assertEqual(self.bptree.search(10), "value10")
        self.assertEqual(self.bptree.search(20), "value20")
        self.assertEqual(self.bptree.search(5), "value5")
        self.assertIsNone(self.bptree.search(99))

    def test_range_search(self):
        for i in range(1, 11):
            self.bptree.insert(i, f"value{i}")
        
        result = self.bptree.range_search(3, 7)
        self.assertEqual(len(result), 5)
        self.assertEqual(result[0][0], 3)
        self.assertEqual(result[-1][0], 7)

    def test_traverse(self):
        keys = [10, 20, 5, 6, 12, 30, 7, 17]
        for key in keys:
            self.bptree.insert(key, f"value{key}")
        
        result = self.bptree.traverse()
        self.assertEqual(len(result), len(keys))
        # Check sorted order
        for i in range(len(result) - 1):
            self.assertLessEqual(result[i][0], result[i + 1][0])

    def test_duplicate_key_overwrites(self):
        # Regression: duplicates used to be stored as separate entries and
        # range_search missed all but the last copies.
        for i in range(10):
            self.bptree.insert(5, "v%d" % i)
        self.assertEqual(self.bptree.search(5), "v9")
        self.assertEqual(self.bptree.range_search(5, 5), [(5, "v9")])
        self.assertEqual(len(self.bptree.traverse()), 1)

    def test_traverse_with_string_keys(self):
        # Regression: traverse() seeded the search with float('-inf').
        for c in "abcdefgh":
            self.bptree.insert(c, c.upper())
        self.assertEqual(self.bptree.traverse(), [(c, c.upper()) for c in "abcdefgh"])
        check_invariants(self.bptree)

    def test_random_against_dict(self):
        for t in (2, 3, 4):
            rng = random.Random(t)
            tree = BPlusTree(t)
            ref = {}
            for step in range(3000):
                key = rng.randrange(0, 400)
                tree.insert(key, step)
                ref[key] = step
                if step % 100 == 0:
                    check_invariants(tree)
            check_invariants(tree)
            self.assertEqual(tree.traverse(), sorted(ref.items()))
            for key in range(-5, 410):
                self.assertEqual(tree.search(key), ref.get(key))
            for _ in range(200):
                lo = rng.randrange(-10, 410)
                hi = rng.randrange(lo, 420)
                want = [(k, v) for k, v in sorted(ref.items()) if lo <= k <= hi]
                self.assertEqual(tree.range_search(lo, hi), want)


if __name__ == "__main__":
    unittest.main()

