"""
Unit tests for Square Root Decomposition.
"""

import unittest
from square_root_decomposition import SqrtDecomposition


class TestSqrtDecomposition(unittest.TestCase):
    def test_query(self):
        arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        sd = SqrtDecomposition(arr)
        self.assertEqual(sd.query(0, 9), sum(arr))
        self.assertEqual(sd.query(2, 7), sum(arr[2:8]))

    def test_update(self):
        arr = [1, 2, 3, 4, 5]
        sd = SqrtDecomposition(arr)
        sd.update(2, 10)
        self.assertEqual(sd.arr[2], 10)
        self.assertEqual(sd.query(0, 4), 1 + 2 + 10 + 4 + 5)

    def test_empty_input(self):
        sd = SqrtDecomposition([])
        self.assertEqual(sd.blocks, [])

    def test_update_does_not_change_callers_list(self):
        arr = [1, 2, 3]
        sd = SqrtDecomposition(arr)
        sd.update(0, 100)
        self.assertEqual(arr, [1, 2, 3])
        self.assertEqual(sd.query(0, 2), 105)

    def test_single_element_and_partial_last_block(self):
        self.assertEqual(SqrtDecomposition([7]).query(0, 0), 7)
        arr = list(range(1, 11))  # block size 4, last block has 2 elements
        sd = SqrtDecomposition(arr)
        self.assertEqual(sd.query(8, 9), 19)
        self.assertEqual(sd.query(3, 9), sum(arr[3:]))

    def test_random_against_brute_force(self):
        import random
        rng = random.Random(5)
        for _ in range(300):
            n = rng.randint(1, 30)
            arr = [rng.randint(-20, 20) for _ in range(n)]
            ref = list(arr)
            sd = SqrtDecomposition(arr)
            for _ in range(30):
                if rng.random() < 0.4:
                    i, v = rng.randrange(n), rng.randint(-20, 20)
                    sd.update(i, v)
                    ref[i] = v
                else:
                    l = rng.randrange(n)
                    r = rng.randrange(l, n)
                    self.assertEqual(sd.query(l, r), sum(ref[l:r + 1]))


if __name__ == "__main__":
    unittest.main()
