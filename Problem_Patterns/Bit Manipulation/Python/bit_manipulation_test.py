"""
Unit tests for Bit Manipulation Patterns.
"""

import unittest
from bit_manipulation import (
    is_power_of_two,
    count_set_bits,
    get_bit,
    set_bit,
    clear_bit,
    toggle_bit,
    lowest_set_bit,
    highest_set_bit,
    count_differing_bits,
    swap_without_temp,
    is_even,
    next_power_of_two,
    subset_generation,
)


class TestIsPowerOfTwo(unittest.TestCase):
    def test_powers_of_two(self):
        self.assertTrue(is_power_of_two(1))
        self.assertTrue(is_power_of_two(2))
        self.assertTrue(is_power_of_two(4))
        self.assertTrue(is_power_of_two(1024))
        self.assertTrue(is_power_of_two(2**20))

    def test_not_powers_of_two(self):
        self.assertFalse(is_power_of_two(0))
        self.assertFalse(is_power_of_two(3))
        self.assertFalse(is_power_of_two(6))
        self.assertFalse(is_power_of_two(15))
        self.assertFalse(is_power_of_two(-4))


class TestCountSetBits(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(count_set_bits(0), 0)
        self.assertEqual(count_set_bits(1), 1)
        self.assertEqual(count_set_bits(7), 3)   # 111
        self.assertEqual(count_set_bits(13), 3)  # 1101
        self.assertEqual(count_set_bits(255), 8) # 11111111

    def test_powers_of_two(self):
        self.assertEqual(count_set_bits(1024), 1)
        self.assertEqual(count_set_bits(2**20), 1)


class TestNegativeInputs(unittest.TestCase):
    def test_negative_counts_as_64_bit_twos_complement(self):
        # Regression: these used to loop forever (Python ints have infinite
        # sign bits). Now they match the C++ and Go versions.
        self.assertEqual(count_set_bits(-1), 64)
        self.assertEqual(count_set_bits(-8), 61)
        self.assertEqual(count_set_bits(-(1 << 63)), 1)
        self.assertEqual(count_differing_bits(-1, 0), 64)
        self.assertEqual(count_differing_bits(-1, -1), 0)


class TestGetBit(unittest.TestCase):
    def test_basic(self):
        # 13 = 1101
        self.assertEqual(get_bit(13, 0), 1)
        self.assertEqual(get_bit(13, 1), 0)
        self.assertEqual(get_bit(13, 2), 1)
        self.assertEqual(get_bit(13, 3), 1)

    def test_zero(self):
        self.assertEqual(get_bit(0, 0), 0)
        self.assertEqual(get_bit(0, 5), 0)


class TestSetBit(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(set_bit(0, 0), 1)
        self.assertEqual(set_bit(0, 3), 8)
        self.assertEqual(set_bit(8, 1), 10)  # 1000 | 0010 = 1010

    def test_already_set(self):
        self.assertEqual(set_bit(7, 0), 7)  # 111, bit 0 already set


class TestClearBit(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(clear_bit(15, 2), 11)  # 1111 -> 1011
        self.assertEqual(clear_bit(7, 1), 5)    # 111 -> 101

    def test_already_clear(self):
        self.assertEqual(clear_bit(8, 0), 8)  # bit 0 already clear


class TestToggleBit(unittest.TestCase):
    def test_toggle_on(self):
        self.assertEqual(toggle_bit(0, 3), 8)

    def test_toggle_off(self):
        self.assertEqual(toggle_bit(15, 2), 11)  # 1111 -> 1011

    def test_double_toggle(self):
        n = 42
        self.assertEqual(toggle_bit(toggle_bit(n, 3), 3), n)


class TestLowestSetBit(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(lowest_set_bit(12), 4)   # 1100 -> 0100
        self.assertEqual(lowest_set_bit(10), 2)   # 1010 -> 0010
        self.assertEqual(lowest_set_bit(1), 1)
        self.assertEqual(lowest_set_bit(8), 8)

    def test_zero(self):
        self.assertEqual(lowest_set_bit(0), 0)


class TestHighestSetBit(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(highest_set_bit(1), 0)
        self.assertEqual(highest_set_bit(8), 3)
        self.assertEqual(highest_set_bit(13), 3)  # 1101 -> position 3
        self.assertEqual(highest_set_bit(255), 7)

    def test_zero(self):
        self.assertEqual(highest_set_bit(0), -1)

    def test_negative(self):
        self.assertEqual(highest_set_bit(-1), -1)


class TestCountDifferingBits(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(count_differing_bits(0, 0), 0)
        self.assertEqual(count_differing_bits(1, 4), 2)  # 001 vs 100
        self.assertEqual(count_differing_bits(7, 0), 3)  # 111 vs 000

    def test_same(self):
        self.assertEqual(count_differing_bits(42, 42), 0)

    def test_hamming(self):
        # 7 = 0111, 10 = 1010 -> XOR = 1101 -> 3 differing bits
        self.assertEqual(count_differing_bits(7, 10), 3)


class TestSwapWithoutTemp(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(swap_without_temp(3, 7), (7, 3))
        self.assertEqual(swap_without_temp(0, 5), (5, 0))

    def test_same_values(self):
        self.assertEqual(swap_without_temp(4, 4), (4, 4))

    def test_negative(self):
        self.assertEqual(swap_without_temp(-3, 7), (7, -3))


class TestIsEven(unittest.TestCase):
    def test_even(self):
        self.assertTrue(is_even(0))
        self.assertTrue(is_even(2))
        self.assertTrue(is_even(100))
        self.assertTrue(is_even(-4))

    def test_odd(self):
        self.assertFalse(is_even(1))
        self.assertFalse(is_even(3))
        self.assertFalse(is_even(99))
        self.assertFalse(is_even(-1))


class TestNextPowerOfTwo(unittest.TestCase):
    def test_basic(self):
        self.assertEqual(next_power_of_two(1), 1)
        self.assertEqual(next_power_of_two(3), 4)
        self.assertEqual(next_power_of_two(5), 8)
        self.assertEqual(next_power_of_two(13), 16)

    def test_exact_powers(self):
        self.assertEqual(next_power_of_two(4), 4)
        self.assertEqual(next_power_of_two(16), 16)
        self.assertEqual(next_power_of_two(1024), 1024)

    def test_zero_and_one(self):
        self.assertEqual(next_power_of_two(0), 1)
        self.assertEqual(next_power_of_two(1), 1)


class TestSubsetGeneration(unittest.TestCase):
    def test_empty_set(self):
        result = subset_generation(0)
        self.assertEqual(result, [[]])

    def test_single_element(self):
        result = subset_generation(1)
        self.assertEqual(len(result), 2)
        self.assertIn([], result)
        self.assertIn([0], result)

    def test_three_elements(self):
        result = subset_generation(3)
        self.assertEqual(len(result), 8)
        self.assertIn([], result)
        self.assertIn([0], result)
        self.assertIn([1], result)
        self.assertIn([2], result)
        self.assertIn([0, 1], result)
        self.assertIn([0, 2], result)
        self.assertIn([1, 2], result)
        self.assertIn([0, 1, 2], result)

    def test_count(self):
        # 2^4 = 16 subsets
        result = subset_generation(4)
        self.assertEqual(len(result), 16)


if __name__ == "__main__":
    unittest.main()
