import gc
import unittest
import weakref
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
            _ = self.arr[0]  # empty: must raise
        self.arr.append(1)
        with self.assertRaises(IndexError):
            _ = self.arr[1]  # out of range

    def test_pop_empty_error(self):
        with self.assertRaises(IndexError):
            self.arr.pop()

    def test_pop_releases_reference(self):
        class Item:
            pass
        item = Item()
        ref = weakref.ref(item)
        self.arr.append(item)
        del item
        self.arr.pop()
        gc.collect()
        self.assertIsNone(ref())

    def test_capacity_shrinks_at_quarter_full(self):
        for i in range(16):
            self.arr.append(i)
        self.assertEqual(self.arr._capacity, 16)
        for _ in range(12):
            self.arr.pop()
        self.assertEqual(len(self.arr), 4)
        self.assertEqual(self.arr._capacity, 8)
        self.assertEqual([self.arr[i] for i in range(4)], [0, 1, 2, 3])

    def test_pop_to_empty_then_append(self):
        for i in range(5):
            self.arr.append(i)
        for _ in range(5):
            self.arr.pop()
        self.arr.append(9)
        self.assertEqual(len(self.arr), 1)
        self.assertEqual(self.arr[0], 9)

if __name__ == "__main__":
    unittest.main()
