import unittest
import array

class TestStaticArray(unittest.TestCase):

    def setUp(self):
        # Static array of integers
        self.arr = array.array('i', [1, 2, 3, 4, 5])

    def test_length(self):
        self.assertEqual(len(self.arr), 5)

    def test_element_access(self):
        self.assertEqual(self.arr[0], 1)
        self.assertEqual(self.arr[2], 3)
        self.assertEqual(self.arr[4], 5)

    def test_element_update(self):
        self.arr[2] = 10
        self.assertEqual(self.arr[2], 10)

    def test_index_error(self):
        with self.assertRaises(IndexError):
            _ = self.arr[5]  # Out of range

if __name__ == "__main__":
    unittest.main()
