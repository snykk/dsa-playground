"""Unit tests for the Python bitmasking helpers."""

import unittest

from bitmasking import (
    get_bit, set_bit, clear_bit, toggle_bit, count_bits, lowest_set_bit,
    clear_lowest_bit, enumerate_subsets, subsets_of_size_k, tsp,
    count_subset_sum, is_power_of_2, next_power_of_2, log2_floor, log2_ceil,
    sos_dp, meet_in_middle_subset_sum,
)


class TestBasicOperations(unittest.TestCase):
    def test_bit_ops(self):
        mask = 0b10110
        self.assertTrue(get_bit(mask, 1))
        self.assertFalse(get_bit(mask, 0))
        self.assertEqual(set_bit(mask, 0), 0b10111)
        self.assertEqual(clear_bit(mask, 1), 0b10100)
        self.assertEqual(toggle_bit(mask, 4), 0b00110)
        self.assertEqual(count_bits(mask), 3)
        self.assertEqual(lowest_set_bit(mask), 0b10)
        self.assertEqual(clear_lowest_bit(mask), 0b10100)

    def test_lowest_bit_of_zero(self):
        self.assertEqual(lowest_set_bit(0), 0)
        self.assertEqual(clear_lowest_bit(0), 0)


class TestSubsets(unittest.TestCase):
    def test_enumerate_subsets_includes_empty(self):
        self.assertEqual(list(enumerate_subsets(0b101)), [0b101, 0b100, 0b001, 0])
        self.assertEqual(list(enumerate_subsets(0)), [0])

    def test_enumerate_subsets_count(self):
        self.assertEqual(len(list(enumerate_subsets(0b1111))), 16)

    def test_subsets_of_size_k(self):
        self.assertEqual(list(subsets_of_size_k(4, 2)),
                         [0b0011, 0b0101, 0b0110, 0b1001, 0b1010, 0b1100])
        self.assertEqual(list(subsets_of_size_k(3, 3)), [0b111])
        self.assertEqual(list(subsets_of_size_k(2, 3)), [])

    def test_subsets_of_size_zero(self):
        """Gosper's hack divides by the lowest set bit; k = 0 has none"""
        self.assertEqual(list(subsets_of_size_k(4, 0)), [0])


class TestTsp(unittest.TestCase):
    def test_four_cities(self):
        dist = [[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]
        self.assertEqual(tsp(dist), 80)

    def test_two_cities(self):
        self.assertEqual(tsp([[0, 7], [7, 0]]), 14)

    def test_single_city(self):
        self.assertEqual(tsp([[0]]), 0)

    def test_no_cities(self):
        self.assertEqual(tsp([]), 0)


class TestTricks(unittest.TestCase):
    def test_is_power_of_2(self):
        self.assertTrue(is_power_of_2(1))
        self.assertTrue(is_power_of_2(1024))
        self.assertFalse(is_power_of_2(0))
        self.assertFalse(is_power_of_2(6))

    def test_next_power_of_2_small(self):
        for n, want in [(0, 1), (1, 1), (2, 2), (3, 4), (5, 8), (1000, 1024)]:
            self.assertEqual(next_power_of_2(n), want)

    def test_next_power_of_2_beyond_32_bits(self):
        self.assertEqual(next_power_of_2(2 ** 32 + 1), 2 ** 33)
        self.assertEqual(next_power_of_2(2 ** 40), 2 ** 40)
        self.assertEqual(next_power_of_2(2 ** 70 + 1), 2 ** 71)

    def test_log2(self):
        self.assertEqual(log2_floor(1), 0)
        self.assertEqual(log2_floor(1000), 9)
        self.assertEqual(log2_ceil(1), 0)
        self.assertEqual(log2_ceil(1000), 10)
        self.assertEqual(log2_ceil(1024), 10)


class TestSubsetSums(unittest.TestCase):
    def test_count_subset_sum(self):
        self.assertEqual(count_subset_sum([1, 2, 3, 4], 5), 2)  # {1,4}, {2,3}
        self.assertEqual(count_subset_sum([], 0), 1)

    def test_meet_in_middle(self):
        self.assertTrue(meet_in_middle_subset_sum([3, 34, 4, 12, 5, 2], 9))
        self.assertFalse(meet_in_middle_subset_sum([3, 34, 4, 12, 5, 2], 30))
        self.assertTrue(meet_in_middle_subset_sum([], 0))


class TestSosDp(unittest.TestCase):
    def test_power_of_two_length(self):
        self.assertEqual(sos_dp([1, 2, 3, 4]), [1, 3, 4, 10])

    def test_non_power_of_two_length(self):
        """Entries past the largest power of two must not be ignored"""
        a = [1, 2, 3, 4, 5, 6]
        expected = [sum(a[sub] for sub in range(len(a)) if sub & mask == sub)
                    for mask in range(len(a))]
        self.assertEqual(sos_dp(a), expected)

    def test_empty_and_single(self):
        self.assertEqual(sos_dp([]), [])
        self.assertEqual(sos_dp([7]), [7])


if __name__ == "__main__":
    unittest.main()
