import unittest
from dynamic_array import DynamicArray

class TestDynamicArray(unittest.TestCase):

    def setUp(self):
        self.arr = DynamicArray()

    def test_append_and_len(self):
        for i in range(5):
            self.arr.append(i)
        self.assertEqual(len(self.arr), 5)
        self.assertEqual(self.arr[0], 0)
        self.assertEqual(self.arr[4], 4)

    def test_pop(self):
        for i in range(5):
            self.arr.append(i)
        val = self.arr.pop()
        self.assertEqual(val, 4)
        self.assertEqual(len(self.arr), 4)

    def test_index_error(self):
        with self.assertRaises(IndexError):
            _ = self.arr[0]  # kosong, harus error
        self.arr.append(1)
        with self.assertRaises(IndexError):
            _ = self.arr[1]  # out of range

    def test_pop_empty_error(self):
        with self.assertRaises(IndexError):
            self.arr.pop()

if __name__ == "__main__":
    unittest.main()
