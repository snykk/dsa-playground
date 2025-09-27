import unittest

class TestMultiDimensionalArray(unittest.TestCase):

    def setUp(self):
        # 3x3 matrix
        self.matrix = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]

    def test_shape(self):
        self.assertEqual(len(self.matrix), 3)          # jumlah baris
        for row in self.matrix:
            self.assertEqual(len(row), 3)             # jumlah kolom per baris

    def test_element_access(self):
        self.assertEqual(self.matrix[0][0], 1)
        self.assertEqual(self.matrix[1][2], 6)
        self.assertEqual(self.matrix[2][1], 8)

    def test_flatten(self):
        rows, cols = 3, 3
        flat = [self.matrix[i][j] for i in range(rows) for j in range(cols)]
        self.assertEqual(flat, [1, 2, 3, 4, 5, 6, 7, 8, 9])

if __name__ == "__main__":
    unittest.main()
