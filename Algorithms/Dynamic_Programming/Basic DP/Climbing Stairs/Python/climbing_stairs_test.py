"""
Test cases for Climbing Stairs
"""

import unittest
from climbing_stairs import (
    climbing_stairs_naive,
    climbing_stairs_memoization,
    climbing_stairs_tabulation,
    climbing_stairs_optimized,
    climbing_stairs_variable_steps
)


class TestClimbingStairs(unittest.TestCase):
    
    def test_base_cases(self):
        """Test base cases"""
        self.assertEqual(climbing_stairs_tabulation(1), 1)
        self.assertEqual(climbing_stairs_tabulation(2), 2)
    
    def test_small_values(self):
        """Test small values"""
        self.assertEqual(climbing_stairs_tabulation(3), 3)
        self.assertEqual(climbing_stairs_tabulation(4), 5)
        self.assertEqual(climbing_stairs_tabulation(5), 8)
    
    def test_all_approaches_same(self):
        """Test all approaches give same result"""
        n = 10
        naive = climbing_stairs_naive(n)
        memo = climbing_stairs_memoization(n)
        tab = climbing_stairs_tabulation(n)
        opt = climbing_stairs_optimized(n)
        
        self.assertEqual(naive, memo)
        self.assertEqual(memo, tab)
        self.assertEqual(tab, opt)
    
    def test_variable_steps(self):
        """Test variable step sizes"""
        result = climbing_stairs_variable_steps(5, [1, 2, 3])
        self.assertGreater(result, 0)
    
    def test_variable_steps_base(self):
        """Test variable steps base case"""
        result = climbing_stairs_variable_steps(0, [1, 2])
        self.assertEqual(result, 1)


if __name__ == '__main__':
    unittest.main()

