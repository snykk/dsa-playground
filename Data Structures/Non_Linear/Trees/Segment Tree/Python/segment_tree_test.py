import unittest
from segment_tree import SegmentTree

class TestSegmentTree(unittest.TestCase):
    def setUp(self):
        self.arr = [1, 3, 5, 7, 9, 11]
        self.st = SegmentTree(self.arr)

    def test_query(self):
        self.assertEqual(self.st.query(0, 2), 9)  # 1 + 3 + 5
        self.assertEqual(self.st.query(1, 3), 15)  # 3 + 5 + 7
        self.assertEqual(self.st.query(0, 5), 36)  # Sum of all

    def test_update(self):
        self.st.update(2, 10)
        self.assertEqual(self.st.get(2), 10)
        self.assertEqual(self.st.query(0, 2), 14)  # 1 + 3 + 10

    def test_single_element(self):
        st = SegmentTree([5])
        self.assertEqual(st.query(0, 0), 5)
        st.update(0, 10)
        self.assertEqual(st.query(0, 0), 10)

    def test_range_queries(self):
        # Test various ranges
        self.assertEqual(self.st.query(0, 0), 1)
        self.assertEqual(self.st.query(5, 5), 11)
        self.assertEqual(self.st.query(2, 4), 21)  # 5 + 7 + 9

if __name__ == "__main__":
    unittest.main()

