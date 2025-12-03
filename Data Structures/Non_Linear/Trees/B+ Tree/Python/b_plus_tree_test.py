import unittest
from b_plus_tree import BPlusTree

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

if __name__ == "__main__":
    unittest.main()

