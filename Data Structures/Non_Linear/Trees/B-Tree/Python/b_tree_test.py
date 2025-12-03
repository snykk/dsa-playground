import unittest
from b_tree import BTree

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

if __name__ == "__main__":
    unittest.main()

