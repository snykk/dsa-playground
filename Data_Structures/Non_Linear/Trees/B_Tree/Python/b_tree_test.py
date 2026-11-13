import unittest
import random
from b_tree import BTree


def check_invariants(tree):
    """Fill bounds, key order and equal leaf depth. Returns the leaf depth."""
    def walk(node, is_root, lo, hi):
        n = len(node.keys)
        assert n <= tree.max_keys
        if not is_root:
            assert n >= tree.min_keys
        elif not node.is_leaf:
            assert n >= 1
        assert node.keys == sorted(node.keys)
        for k in node.keys:
            assert (lo is None or k >= lo) and (hi is None or k <= hi)
        if node.is_leaf:
            assert not node.children
            return 0
        assert len(node.children) == n + 1
        depths = set()
        for i, child in enumerate(node.children):
            c_lo = lo if i == 0 else node.keys[i - 1]
            c_hi = hi if i == n else node.keys[i]
            depths.add(walk(child, False, c_lo, c_hi))
        assert len(depths) == 1
        return depths.pop() + 1
    return walk(tree.root, True, None, None)

class TestBTree(unittest.TestCase):
    def setUp(self):
        self.btree = BTree(min_degree=3)

    def test_insert_and_search(self):
        keys = [10, 20, 5, 6, 12, 30, 7, 17]
        for key in keys:
            self.btree.insert(key)
        
        for key in keys:
            result = self.btree.search(key)
            self.assertIsNotNone(result)
            self.assertEqual(result[0].keys[result[1]], key)

    def test_traverse(self):
        keys = [10, 20, 5, 6, 12, 30, 7, 17]
        for key in keys:
            self.btree.insert(key)
        
        result = self.btree.traverse()
        self.assertEqual(sorted(keys), result)

    def test_delete(self):
        keys = [10, 20, 5, 6, 12, 30, 7, 17]
        for key in keys:
            self.btree.insert(key)
        
        self.btree.delete(6)
        result = self.btree.search(6)
        self.assertIsNone(result)
        
        # Other keys should still exist
        self.assertIsNotNone(self.btree.search(10))

    def test_delete_middle_child_merge(self):
        # Regression: merging a middle child with its left sibling sent the
        # delete into the wrong subtree and left the key in the tree.
        tree = BTree(3)
        for k in range(1, 13):
            tree.insert(k)
        tree.delete(4)
        self.assertIsNone(tree.search(4))
        self.assertEqual(tree.traverse(), [k for k in range(1, 13) if k != 4])
        check_invariants(tree)

    def test_delete_t2_no_empty_internal_node(self):
        tree = BTree(2)
        keys = [29, 9, 1, 27, 2, 23, 0, 25, 26, 10, 6, 18, 24, 21]
        for k in keys:
            tree.insert(k)
        tree.delete(24)
        self.assertIsNone(tree.search(24))
        self.assertEqual(tree.traverse(), sorted(set(keys) - {24}))
        check_invariants(tree)

    def test_delete_missing_key_is_noop(self):
        for k in range(20):
            self.btree.insert(k)
        self.btree.delete(99)
        self.assertEqual(self.btree.traverse(), list(range(20)))
        check_invariants(self.btree)

    def test_random_against_sorted_list(self):
        for t in (2, 3, 4):
            rng = random.Random(t)
            tree = BTree(t)
            ref = set()
            for step in range(3000):
                key = rng.randrange(0, 150)
                op = rng.random()
                if op < 0.5:
                    if key not in ref:
                        tree.insert(key)
                        ref.add(key)
                elif op < 0.9:
                    tree.delete(key)
                    ref.discard(key)
                else:
                    self.assertEqual(tree.search(key) is not None, key in ref)
                if step % 50 == 0:
                    check_invariants(tree)
                    self.assertEqual(tree.traverse(), sorted(ref))
            check_invariants(tree)
            self.assertEqual(tree.traverse(), sorted(ref))
            for k in sorted(ref):
                tree.delete(k)
                check_invariants(tree)
            self.assertEqual(tree.traverse(), [])


if __name__ == "__main__":
    unittest.main()

