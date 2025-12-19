"""
Unit tests for Chinese Remainder Theorem
"""

import unittest
from chinese_remainder_theorem import (
    chinese_remainder_theorem,
    chinese_remainder_theorem_pairwise,
    verify_crt_solution
)


class TestChineseRemainderTheorem(unittest.TestCase):
    
    def test_basic_crt(self):
        """Test basic CRT problem"""
        remainders = [2, 3, 2]
        moduli = [3, 5, 7]
        solution = chinese_remainder_theorem(remainders, moduli)
        self.assertIsNotNone(solution)
        self.assertEqual(solution, 23)
        self.assertTrue(verify_crt_solution(solution, remainders, moduli))
    
    def test_two_congruences(self):
        """Test system with two congruences"""
        remainders = [1, 2]
        moduli = [3, 5]
        solution = chinese_remainder_theorem(remainders, moduli)
        self.assertIsNotNone(solution)
        self.assertEqual(solution, 7)
        self.assertTrue(verify_crt_solution(solution, remainders, moduli))
    
    def test_three_congruences(self):
        """Test system with three congruences"""
        remainders = [1, 2, 3]
        moduli = [3, 5, 7]
        solution = chinese_remainder_theorem(remainders, moduli)
        self.assertIsNotNone(solution)
        self.assertTrue(verify_crt_solution(solution, remainders, moduli))
    
    def test_not_coprime(self):
        """Test with moduli that are not pairwise coprime"""
        remainders = [1, 2]
        moduli = [4, 6]  # GCD(4, 6) = 2 != 1
        solution = chinese_remainder_theorem(remainders, moduli)
        self.assertIsNone(solution)
    
    def test_pairwise_crt(self):
        """Test pairwise CRT function"""
        solution = chinese_remainder_theorem_pairwise(1, 3, 2, 5)
        self.assertIsNotNone(solution)
        self.assertEqual(solution, 7)
        self.assertEqual(solution % 3, 1)
        self.assertEqual(solution % 5, 2)
    
    def test_pairwise_crt_not_coprime(self):
        """Test pairwise CRT with non-coprime moduli"""
        solution = chinese_remainder_theorem_pairwise(1, 4, 2, 6)
        self.assertIsNone(solution)
    
    def test_verify_solution(self):
        """Test solution verification"""
        remainders = [2, 3, 2]
        moduli = [3, 5, 7]
        solution = 23
        self.assertTrue(verify_crt_solution(solution, remainders, moduli))
        
        # Wrong solution
        self.assertFalse(verify_crt_solution(22, remainders, moduli))
    
    def test_larger_moduli(self):
        """Test with larger moduli"""
        remainders = [1, 2, 3, 4]
        moduli = [5, 7, 11, 13]
        solution = chinese_remainder_theorem(remainders, moduli)
        self.assertIsNotNone(solution)
        self.assertTrue(verify_crt_solution(solution, remainders, moduli))
    
    def test_single_congruence(self):
        """Test with single congruence (trivial case)"""
        remainders = [5]
        moduli = [7]
        solution = chinese_remainder_theorem(remainders, moduli)
        self.assertIsNotNone(solution)
        self.assertEqual(solution, 5)
        self.assertTrue(verify_crt_solution(solution, remainders, moduli))


if __name__ == '__main__':
    unittest.main()
